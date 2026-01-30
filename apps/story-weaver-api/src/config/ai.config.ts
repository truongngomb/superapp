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
// =============================================================================
// AI Model Definitions
// =============================================================================

/**
 * Available AI models for text generation
 * Updated based on Antigravity provider list
 */
export const AI_TEXT_MODELS = {
  // Fast / Efficiency Models
  GEMINI_3_FLASH_PREVIEW: 'gemini-3-flash-preview',
  GEMINI_2_5_FLASH: 'gemini-2.5-flash',
  GEMINI_2_5_FLASH_LITE: 'gemini-2.5-flash-lite',

  // High Quality / Creative Models
  GEMINI_3_PRO_HIGH: 'gemini-3-pro-high',
  GEMINI_CLAUDE_SONNET_4_5: 'gemini-claude-sonnet-4-5',

  // Reasoning / Specialized Models
  GEMINI_CLAUDE_SONNET_4_5_THINKING: 'gemini-claude-sonnet-4-5-thinking',
  GEMINI_CLAUDE_OPUS_4_5_THINKING: 'gemini-claude-opus-4-5-thinking',

  // Open Source / Other
  GPT_OSS_120B_MEDIUM: 'gpt-oss-120b-medium',
} as const;

export type AITextModel = (typeof AI_TEXT_MODELS)[keyof typeof AI_TEXT_MODELS];

export const aiTextModelSchema = z.nativeEnum(AI_TEXT_MODELS);

/**
 * Available AI models for image generation
 */
export const AI_IMAGE_MODELS = {
  GEMINI_3_PRO_IMAGE_PREVIEW: 'gemini-3-pro-image-preview',
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
    .default('sk-dummy'), 
  
  // Default Models
  AI_DEFAULT_TEXT_MODEL: z
    .string()
    .default(AI_TEXT_MODELS.GEMINI_3_FLASH_PREVIEW),
  
  AI_DEFAULT_IMAGE_MODEL: z
    .string()
    .default(AI_IMAGE_MODELS.GEMINI_3_PRO_IMAGE_PREVIEW),
  
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
    .default('60') // Higher limit for Flash models
    .transform((val) => parseInt(val, 10)),
});

// =============================================================================
// Parse AI Environment
// =============================================================================

const parseAIEnv = () => {
  const envVars = { ...process.env };
  
  // Fallback to GEMINI_API_KEY if AI_API_KEY is missing
  if (!envVars.AI_API_KEY && envVars.GEMINI_API_KEY) {
    envVars.AI_API_KEY = envVars.GEMINI_API_KEY;
  }

  const result = aiEnvSchema.safeParse(envVars);
  
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
