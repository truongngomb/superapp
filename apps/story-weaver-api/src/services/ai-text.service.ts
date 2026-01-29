/**
 * AI Text Generation Service
 * 
 * Uses OpenAI-compatible API (CLIProxyAPI) for text generation.
 * Supports multiple models (Gemini, Claude, GPT, etc.)
 */
import OpenAI from 'openai';
import { aiConfig, type AITextModel, AI_TEXT_MODELS } from '../config/ai.config.js';
import { logger } from '../utils/logger.js';

// =============================================================================
// Types
// =============================================================================

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface TextGenerationOptions {
  /** Model to use (defaults to config default) */
  model?: AITextModel;
  /** Temperature for creativity (0-2, default 0.7) */
  temperature?: number;
  /** Maximum tokens to generate */
  maxTokens?: number;
  /** Whether to stream response */
  stream?: boolean;
  /** System prompt */
  systemPrompt?: string;
}

export interface TextGenerationResult {
  content: string;
  model: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  finishReason?: string;
}

// =============================================================================
// AI Text Service Class
// =============================================================================

class AITextService {
  private client: OpenAI;
  
  constructor() {
    this.client = new OpenAI({
      apiKey: aiConfig.apiKey,
      baseURL: aiConfig.baseUrl,
      timeout: aiConfig.requestTimeoutMs,
    });
    
    logger.info('AITextService', `Initialized with base URL: ${aiConfig.baseUrl}`);
  }
  
  /**
   * Generate text completion
   */
  async generate(
    prompt: string,
    options: TextGenerationOptions = {}
  ): Promise<TextGenerationResult> {
    const {
      model = aiConfig.defaultTextModel,
      temperature = 0.7,
      maxTokens = 2048,
      systemPrompt,
    } = options;
    
    const messages: ChatMessage[] = [];
    
    if (systemPrompt) {
      messages.push({ role: 'system', content: systemPrompt });
    }
    
    messages.push({ role: 'user', content: prompt });
    
    return this.chat(messages, { ...options, model, temperature, maxTokens });
  }
  
  /**
   * Chat completion with message history
   */
  async chat(
    messages: ChatMessage[],
    options: TextGenerationOptions = {}
  ): Promise<TextGenerationResult> {
    const {
      model = aiConfig.defaultTextModel,
      temperature = 0.7,
      maxTokens = 2048,
    } = options;
    
    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= aiConfig.maxRetries; attempt++) {
      try {
        logger.debug('AITextService', `Attempt ${attempt}/${aiConfig.maxRetries} with model: ${model}`);
        
        const completion = await this.client.chat.completions.create({
          model,
          messages: messages.map(m => ({
            role: m.role,
            content: m.content,
          })),
          temperature,
          max_tokens: maxTokens,
          stream: false,
        });
        
        const choice = completion.choices[0];
        
        if (!choice?.message?.content) {
          throw new Error('Empty response from AI');
        }
        
        return {
          content: choice.message.content,
          model: completion.model,
          usage: completion.usage ? {
            promptTokens: completion.usage.prompt_tokens,
            completionTokens: completion.usage.completion_tokens,
            totalTokens: completion.usage.total_tokens,
          } : undefined,
          finishReason: choice.finish_reason ?? undefined,
        };
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        logger.warn('AITextService', `Attempt ${attempt} failed: ${lastError.message}`);
        
        if (attempt < aiConfig.maxRetries) {
          await this.delay(aiConfig.retryDelayMs * attempt);
        }
      }
    }
    
    throw lastError ?? new Error('Text generation failed after all retries');
  }
  
  /**
   * Generate JSON response (with JSON mode if supported)
   */
  async generateJSON<T>(
    prompt: string,
    options: TextGenerationOptions = {}
  ): Promise<T> {
    const systemPrompt = `${options.systemPrompt ?? ''}
You must respond with valid JSON only. No markdown, no explanations, just JSON.`;
    
    const result = await this.generate(prompt, {
      ...options,
      systemPrompt: systemPrompt.trim(),
    });
    
    // Try to extract JSON from response
    const content = result.content.trim();
    const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) 
      ?? content.match(/```\s*([\s\S]*?)\s*```/);
    
    const jsonStr = jsonMatch?.[1] ?? content;
    
    try {
      return JSON.parse(jsonStr) as T;
    } catch {
      logger.error('AITextService', `Failed to parse JSON: ${jsonStr.slice(0, 100)}...`);
      throw new Error('AI response is not valid JSON');
    }
  }
  
  /**
   * Get list of available models
   */
  getAvailableModels(): AITextModel[] {
    return aiConfig.availableTextModels;
  }
  
  /**
   * Check if a model is available
   */
  isModelAvailable(model: string): model is AITextModel {
    return Object.values(AI_TEXT_MODELS).includes(model as AITextModel);
  }
  
  /**
   * Test connection to AI service
   */
  async testConnection(): Promise<boolean> {
    try {
      const result = await this.generate('Say "OK"', {
        maxTokens: 10,
        temperature: 0,
      });
      return result.content.toLowerCase().includes('ok');
    } catch (error) {
      logger.error('AITextService', `Connection test failed: ${error}`);
      return false;
    }
  }
  
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// =============================================================================
// Singleton Export
// =============================================================================

export const aiTextService = new AITextService();
