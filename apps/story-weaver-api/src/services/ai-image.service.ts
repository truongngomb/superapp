import OpenAI from 'openai';
import { aiConfig, type AIImageModel } from '../config/ai.config.js';
import { logger } from '../utils/logger.js';
import crypto from 'crypto';

// =============================================================================
// Types
// =============================================================================

import { getArtStyleById } from '../config/art-styles.config.js';
import { settingService } from './setting.service.js';
import { SWSettingKey } from '../types/settings.js';

export interface ImageGenerationOptions {
  /** Model to use */
  model?: AIImageModel | string;
  /** Image width */
  width?: number;
  /** Image height */
  height?: number;
  /** Number of images to generate */
  count?: number;
  /** Seed for reproducibility */
  seed?: number;
  /** Negative prompt (what to avoid) */
  negativePrompt?: string;
  /** Guidance scale (CFG) */
  guidanceScale?: number;
  /** Number of inference steps */
  steps?: number;
  /** Art Style ID to apply */
  styleId?: string;
}

export interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  seed?: number;
  model: string;
  generatedAt: string;
}

export interface ImageGenerationResult {
  images: GeneratedImage[];
  model: string;
  /** Cost estimate in USD */
  estimatedCost?: number;
}


class AIImageService {
  private client: OpenAI;

  constructor() {
    this.client = new OpenAI({
      apiKey: aiConfig.apiKey,
      baseURL: aiConfig.baseUrl,
      timeout: aiConfig.requestTimeoutMs * 2, // Images take longer
    });
    logger.info('AIImageService', `Initialized with base URL: ${aiConfig.baseUrl}`);
  }
  
  /**
   * Generate images from prompt
   */
  async generate(
    prompt: string,
    options: ImageGenerationOptions = {}
  ): Promise<ImageGenerationResult> {
    const {
      model = aiConfig.defaultImageModel,
      count = 1,
      styleId,
    } = options;
    
    // 1. Resolve Art Style
    const styleConfig = styleId ? getArtStyleById(styleId) : undefined;
    
    // 2. Resolve Base Prompt from Settings
    const basePrompt = await settingService.get(SWSettingKey.PROMPT_VISUAL_GEN_BASE, '');
    
    // 3. Construct Final Positive Prompt
    // Format: "Base Quality, Style Prompt, Subject/Action Prompt"
    const parts = [basePrompt];
    if (styleConfig) parts.push(styleConfig.prompt);
    parts.push(prompt);
    const finalPrompt = parts.filter(Boolean).join(', ');
    
    // 4. Construct Negative Prompt
    const negativeParts = [];
    if (options.negativePrompt) negativeParts.push(options.negativePrompt);
    if (styleConfig?.negativePrompt) negativeParts.push(styleConfig.negativePrompt);
    const finalNegativePrompt = negativeParts.join(', ');

    logger.info('AIImageService', `Generate request (Style: ${styleConfig?.name || 'None'}): ${finalPrompt.slice(0, 50)}...`);
    
    try {      
      // Helper to generate single image
      const generateSingle = async (_: number): Promise<GeneratedImage> => {
          const contentPrompt = `Generate high-quality image.
POSITIVE PROMPT: ${finalPrompt}
${finalNegativePrompt ? `NEGATIVE PROMPT: ${finalNegativePrompt}` : ''}
Return base64 if possible.`;

          const response = await this.client.chat.completions.create({
            model: model,
            messages: [{ role: "user", content: contentPrompt }],
            max_tokens: 4096,
            temperature: 0.7
          } as never); // Cast to allow extra_body if types are strict


          const message = response.choices[0]?.message as { content?: string; images?: Array<{ image_url?: { url?: string } }> } | undefined;
          const content = message?.content || '';
          const messageImages = message?.images;
          
          logger.info('AIImageService', `Raw AI Response Content Length: ${content?.length || 0}`);
          logger.info('AIImageService', `Has Message Images: ${!!messageImages}`);

          let url = '';

          // 1. Check for custom 'images' array (Gemini Proxy format)
          if (messageImages && Array.isArray(messageImages) && messageImages.length > 0) {
             const imgObj = messageImages[0];
             if (imgObj?.image_url?.url) {
                url = imgObj.image_url.url;
             }
          }

          // 2. Check for Base64 in content
          if (!url && content) {
             const base64Match = content.match(/data:image\/[a-z]+;base64,([A-Za-z0-9+/=]+)/);
             if (base64Match) {
                url = base64Match[0];
             }
          }

          // 3. Fallback: Check for URL in text content
          if (!url && content) {
             const urlMatch = content.match(/https?:\/\/[^\s)]+/);
             if (urlMatch) {
                url = urlMatch[0];
             }
          }


          if (!response.choices || response.choices.length === 0) {
             throw new Error(`Invalid response from AI: No choices returned. Full response: ${JSON.stringify(response)}`);
          }

          // If no URL found and no content, then it's an error
          if (!url && !content) {
             throw new Error(`Invalid response from AI: Content is empty and no images found. Finish reason: ${response.choices[0]?.finish_reason}. Full response: ${JSON.stringify(response)}`);
          }

          if (!url || (!url.startsWith('http') && !url.startsWith('data:image'))) {
             throw new Error(`Invalid response from AI: No image URL or Base64 found. Content preview: ${content.slice(0, 100)}...`);
          }

          return {
            id: crypto.randomUUID(),
            url: url,
            prompt: prompt,
            model: model,
            generatedAt: new Date().toISOString(),
          };
      };

      // Execute in parallel for count > 1
      const promises = Array.from({ length: count }, (_, i) => generateSingle(i));
      const images = await Promise.all(promises);

      return {
        images,
        model,
        estimatedCost: 0.04 * count,
      };

    } catch (error) {
      logger.error('AIImageService', 'Image generation failed', error);
      // Fallback to placeholder in DEV
      throw error;
    }
  }
  
  /**
   * Generate portrait with reference image (Fallback to prompt engineering)
   */
  async generateWithReference(
    prompt: string,
    referenceImageUrl: string,
    options: ImageGenerationOptions = {}
  ): Promise<ImageGenerationResult> {
    logger.info('AIImageService', `Generate with reference: ${referenceImageUrl}`);
    // Append reference disclaimer to prompt as fallback
    const enhancedPrompt = `${prompt} (Style reference: ${referenceImageUrl})`; 
    return this.generate(enhancedPrompt, options);
  }
  
  // ... (Rest methods) ...
  
  getAvailableModels(): AIImageModel[] {
    return aiConfig.availableImageModels;
  }
  
  async testConnection(): Promise<boolean> {
     try {
       await this.generate('Test image', { count: 1, width: 256, height: 256 });
       return true;
     } catch (e) {
       console.error(e);
       return false;
     }
  }

  estimateCost(options: ImageGenerationOptions = {}): number {
    return (options.count || 1) * 0.04;
  }
}

export const aiImageService = new AIImageService();
