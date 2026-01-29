/**
 * AI Configuration
 * 
 * Supports custom AI proxy (CLIProxyAPI) with OpenAI-compatible interface.
 * Configure via environment variables.
 */
import { z } from 'zod';
import { logger } from '../utils/logger.js';

// =============================================================================
// AI Model Definitions
// =============================================================================

/**
 * Available AI models for text generation
 * Add new models here as they become available
 */
export const AI_TEXT_MODELS = {
  // Gemini Models
  GEMINI_3_FLASH_PREVIEW: 'gemini-3-flash-preview',
  GEMINI_2_FLASH: 'gemini-2.0-flash-exp',
  GEMINI_15_FLASH: 'gemini-1.5-flash',
  GEMINI_15_PRO: 'gemini-1.5-pro',
  
  // Claude Models
  CLAUDE_35_SONNET: 'claude-3-5-sonnet-20241022',
  CLAUDE_35_HAIKU: 'claude-3-5-haiku-20241022',
  
  // OpenAI Models
  GPT_4O: 'gpt-4o',
  GPT_4O_MINI: 'gpt-4o-mini',
  GPT_5: 'gpt-5',
  
  // Open Source (via proxy)
  LLAMA_3: 'llama-3',
  QWEN_25: 'qwen-2.5',
} as const;

export type AITextModel = (typeof AI_TEXT_MODELS)[keyof typeof AI_TEXT_MODELS];

export const aiTextModelSchema = z.enum([
  AI_TEXT_MODELS.GEMINI_3_FLASH_PREVIEW,
  AI_TEXT_MODELS.GEMINI_2_FLASH,
  AI_TEXT_MODELS.GEMINI_15_FLASH,
  AI_TEXT_MODELS.GEMINI_15_PRO,
  AI_TEXT_MODELS.CLAUDE_35_SONNET,
  AI_TEXT_MODELS.CLAUDE_35_HAIKU,
  AI_TEXT_MODELS.GPT_4O,
  AI_TEXT_MODELS.GPT_4O_MINI,
  AI_TEXT_MODELS.GPT_5,
  AI_TEXT_MODELS.LLAMA_3,
  AI_TEXT_MODELS.QWEN_25,
]);

/**
 * Available AI models for image generation
 */
export const AI_IMAGE_MODELS = {
  // Stable Diffusion
  SDXL: 'stable-diffusion-xl',
  SD_3: 'stable-diffusion-3',
  
  // Flux
  FLUX_SCHNELL: 'flux-schnell',
  FLUX_DEV: 'flux-dev',
  
  // Others
  DALLE_3: 'dall-e-3',
} as const;

export type AIImageModel = (typeof AI_IMAGE_MODELS)[keyof typeof AI_IMAGE_MODELS];

// =============================================================================
// Environment Schema for AI Config
// =============================================================================

const aiEnvSchema = z.object({
  // AI Proxy Configuration
  AI_BASE_URL: z
    .string()
    .url()
    .default('https://ai.izp.one/v1'),
  
  AI_API_KEY: z
    .string()
    .default('sk-dummy'), // CLIProxyAPI ignores real key
  
  // Default Models
  AI_DEFAULT_TEXT_MODEL: z
    .string()
    .default(AI_TEXT_MODELS.GEMINI_3_FLASH_PREVIEW),
  
  AI_DEFAULT_IMAGE_MODEL: z
    .string()
    .default(AI_IMAGE_MODELS.FLUX_SCHNELL),
  
  // Retry Configuration
  AI_MAX_RETRIES: z
    .string()
    .default('3')
    .transform((val) => parseInt(val, 10)),
  
  AI_RETRY_DELAY_MS: z
    .string()
    .default('1000')
    .transform((val) => parseInt(val, 10)),
  
  // Timeout
  AI_REQUEST_TIMEOUT_MS: z
    .string()
    .default('60000')
    .transform((val) => parseInt(val, 10)),
  
  // Rate Limiting
  AI_RATE_LIMIT_RPM: z
    .string()
    .default('15')
    .transform((val) => parseInt(val, 10)),
});

// =============================================================================
// Parse AI Environment
// =============================================================================

const parseAIEnv = () => {
  const result = aiEnvSchema.safeParse(process.env);
  
  if (!result.success) {
    logger.warn('AI Config', 'Using default AI configuration');
    return aiEnvSchema.parse({});
  }
  
  return result.data;
};

const aiEnv = parseAIEnv();

// =============================================================================
// Exported AI Configuration
// =============================================================================

export const aiConfig = {
  /** Base URL for AI API (OpenAI-compatible) */
  baseUrl: aiEnv.AI_BASE_URL,
  
  /** API Key (dummy for CLIProxyAPI) */
  apiKey: aiEnv.AI_API_KEY,
  
  /** Default text generation model */
  defaultTextModel: aiEnv.AI_DEFAULT_TEXT_MODEL as AITextModel,
  
  /** Default image generation model */
  defaultImageModel: aiEnv.AI_DEFAULT_IMAGE_MODEL as AIImageModel,
  
  /** Maximum retry attempts */
  maxRetries: aiEnv.AI_MAX_RETRIES,
  
  /** Delay between retries in ms */
  retryDelayMs: aiEnv.AI_RETRY_DELAY_MS,
  
  /** Request timeout in ms */
  requestTimeoutMs: aiEnv.AI_REQUEST_TIMEOUT_MS,
  
  /** Rate limit (requests per minute) */
  rateLimitRpm: aiEnv.AI_RATE_LIMIT_RPM,
  
  /** Available text models */
  availableTextModels: Object.values(AI_TEXT_MODELS),
  
  /** Available image models */
  availableImageModels: Object.values(AI_IMAGE_MODELS),
} as const;

export type AIConfig = typeof aiConfig;

// =============================================================================
// Helper: Log AI Config on startup (redacted)
// =============================================================================

export function logAIConfig(): void {
  logger.info('AI Config', 'AI Service Configuration:');
  logger.info('AI Config', `  Base URL: ${aiConfig.baseUrl}`);
  logger.info('AI Config', `  API Key: ${aiConfig.apiKey.slice(0, 8)}...`);
  logger.info('AI Config', `  Default Text Model: ${aiConfig.defaultTextModel}`);
  logger.info('AI Config', `  Default Image Model: ${aiConfig.defaultImageModel}`);
  logger.info('AI Config', `  Max Retries: ${aiConfig.maxRetries}`);
  logger.info('AI Config', `  Rate Limit: ${aiConfig.rateLimitRpm} RPM`);
}
