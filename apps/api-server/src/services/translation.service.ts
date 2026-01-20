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
      // For now, use a free translation approach
      // In production, use @google-cloud/translate or similar
      const translated = await this.translateWithGoogleAPI(text, fromLang, toLang);
      
      // If preserveMarkdown, restore markdown syntax
      if (preserveMarkdown) {
        return { translatedText: this.preserveMarkdownFormat(text, translated) };
      }
      
      return { translatedText: translated };
    } catch (error) {
      console.error('Translation error:', error);
      // Fallback: return original text
      return { translatedText: text };
    }
  }

  /**
   * Translate using Google Translate (via unofficial API)
   * TODO: Replace with official Google Cloud Translation API for production
   */
  private async translateWithGoogleAPI(
    text: string,
    from: string,
    to: string
  ): Promise<string> {
    // Using Google Translate unofficial endpoint
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${from}&tl=${to}&dt=t&q=${encodeURIComponent(text)}`;
    
    try {
      const response = await fetch(url);
      const data = await response.json() as unknown;
      
      if (Array.isArray(data) && Array.isArray(data[0])) {
        // Google Translate returns array of [translated, original, ...]
        const translations = data[0] as Array<[string, unknown]>;
        return translations.map((item) => item[0]).join('');
      }
      
      return text; // Fallback
    } catch {
      return text; // Fallback on error
    }
  }

  /**
   * Preserve markdown formatting in translated text
   * This attempts to maintain headers, lists, links, code blocks, etc.
   */
  private preserveMarkdownFormat(original: string, translated: string): string {
    // Simple heuristic: if original starts with markdown syntax, preserve it
    const patterns = [
      { regex: /^(#{1,6}\s+)/, type: 'heading' },      // # Heading
      { regex: /^(\*\s+|-\s+|\d+\.\s+)/, type: 'list' }, // * List or 1. List
      { regex: /^(>\s+)/, type: 'blockquote' },        // > Quote
      { regex: /^(```[\s\S]*?```)/, type: 'codeblock' }, // ```code```
    ];

    for (const pattern of patterns) {
      const match = original.match(pattern.regex);
      if (match && match[1]) {
        // Preserve the markdown prefix
        const prefix = match[1];
        if (!translated.startsWith(prefix)) {
          return prefix + translated.replace(pattern.regex, '');
        }
      }
    }

    return translated;
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
