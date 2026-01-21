/**
 * Translation Service
 * Provides auto-translation using Google Translate API
 */

interface TranslateOptions {
  text: string;
  fromLang: 'en' | 'vi' | 'ko';
  toLang: 'en' | 'vi' | 'ko';
  preserveMarkdown?: boolean;
}

interface TranslateResult {
  translatedText: string;
  detectedSourceLanguage?: string;
}

/**
 * Google Translate API (Free - via @vitalets/google-translate-api)
 * Note: For production, consider using official Google Cloud Translation API
 */
export class TranslationService {
  /**
   * Translate text using Google Translate API
   */
  async translate(options: TranslateOptions): Promise<TranslateResult> {
    const { text, fromLang, toLang, preserveMarkdown = true } = options;

    if (!text || text.trim() === '') {
      return { translatedText: '' };
    }

    if (fromLang === toLang) {
      return { translatedText: text };
    }

    try {
      let textToTranslate = text;
      const maskMap = new Map<string, string>();

      // 1. Mask Markdown Code Blocks if needed
      if (preserveMarkdown) {
        textToTranslate = this.maskMarkdown(text, maskMap);
      }

      // 2. Translate
      const translated = await this.translateWithGoogleAPI(textToTranslate, fromLang, toLang);
      
      // 3. Unmask
      let finalResult = translated;
      if (preserveMarkdown) {
        finalResult = this.unmaskMarkdown(translated, maskMap);
      }
      
      return { translatedText: finalResult };
    } catch (error) {
      console.error('Translation error:', error);
      // Fallback: return original text
      return { translatedText: text };
    }
  }

  /**
   * Mask sensitive markdown parts (Code blocks)
   * Replaces ```code``` with __MD_CODE_BLOCK_N__
   */
  private maskMarkdown(text: string, maskMap: Map<string, string>): string {
    let masked = text;
    let counter = 0;

    // Mask Code Blocks (``` ... ```)
    masked = masked.replace(/```[\s\S]*?```/g, (match) => {
      const key = `__MD_CODE_BLOCK_${(counter++).toString()}__`;
      maskMap.set(key, match);
      return key; // Google Translate treats CAPS_WITH_UNDERSCORES as names usually, but better to use something unique
    });

    // Mask Inline Code (`...`)
    masked = masked.replace(/`[^`]+`/g, (match) => {
       const key = `__MD_INLINE_CODE_${(counter++).toString()}__`;
       maskMap.set(key, match);
       return key;
    });

    return masked;
  }

  /**
   * Restore masked parts
   */
  private unmaskMarkdown(text: string, maskMap: Map<string, string>): string {
    let unmasked = text;
    
    // Restore all keys
    maskMap.forEach((value, key) => {
      // Create a regex to replace the key (handling potential spacing inserted by translator)
      // Translator might verify to: __ MD_CODE_BLOCK_0 __
      const escapedKey = key.replace(/_/g, ' ?_ ?'); // Allow spaces around underscores
      const regex = new RegExp(escapedKey, 'g');
      
      // Use callback to avoid $ replacement issues in code content
      unmasked = unmasked.replace(regex, () => value);
    });

    return unmasked;
  }

  /**
   * Translate using Google Translate (via unofficial API)
   * Uses POST to handle larger payloads
   */
  private async translateWithGoogleAPI(
    text: string,
    from: string,
    to: string
  ): Promise<string> {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&dt=t`;
    
    try {
      const params = new URLSearchParams();
      params.append('sl', from);
      params.append('tl', to);
      params.append('q', text);

      const response = await fetch(url, {
         method: 'POST',
         headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
         },
         body: params
      });

      if (!response.ok) {
         throw new Error(`Google Translate API Error: ${response.statusText}`);
      }

      const data = await response.json() as unknown;
      
      if (Array.isArray(data) && Array.isArray(data[0])) {
        // Google Translate returns array of [translated, original, ...]
        const translations = data[0] as Array<[string, unknown]>;
        return translations.map((item) => item[0]).join('');
      }
      
      return text; 
    } catch (error) {
      console.error('External Translation API Failed:', error);
      throw error;
    }
  }

  /**
   * Batch translate multiple fields
   */
  async translateFields(
    fields: Record<string, string>,
    fromLang: 'en' | 'vi' | 'ko',
    toLang: 'en' | 'vi' | 'ko'
  ): Promise<Record<string, string>> {
    const results: Record<string, string> = {};

    for (const [key, value] of Object.entries(fields)) {
      if (!value) {
         results[key] = value;
         continue;
      }
      
      const { translatedText } = await this.translate({
        text: value,
        fromLang,
        toLang,
        preserveMarkdown: key === 'content', // Only preserve for content field
      });
      results[key] = translatedText;
    }

    return results;
  }
}

export const translationService = new TranslationService();
