/**
 * Environment Configuration with Zod Validation
 * 
 * This module provides type-safe environment variable parsing and validation.
 * All environment variables are validated at startup - invalid config will throw.
 */
import 'dotenv/config';
import { z } from 'zod';
import { logger } from '../utils/logger.js';

// =============================================================================
// Environment Schema Definition
// =============================================================================

const envSchema = z.object({
  // Server
  PORT: z
    .string()
    .default('3002') 
    .transform((val) => parseInt(val, 10))
    .refine((val) => val > 0 && val < 65536, 'PORT must be between 1 and 65535'),
  
  HOST: z
    .string()
    .default('0.0.0.0'),
  
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  
  // URLs
  CLIENT_URL: z
    .string()
    .url('CLIENT_URL must be a valid URL')
    .default('http://127.0.0.1:3102'), 
  
  SERVER_URL: z
    .string()
    .url('SERVER_URL must be a valid URL')
    .default('http://127.0.0.1:3002'),
  
  API_SERVER_URL: z
    .string()
    .url('API_SERVER_URL must be a valid URL')
    .default('http://127.0.0.1:3001'),

  // Database
  POCKETBASE_URL: z
    .string()
    .url('POCKETBASE_URL must be a valid URL')
    .default('http://127.0.0.1:8090'),
  
  // PocketBase Admin (for migrations)
  POCKETBASE_ADMIN_EMAIL: z
    .string()
    .email('POCKETBASE_ADMIN_EMAIL must be a valid email')
    .optional(),
  
  POCKETBASE_ADMIN_PASSWORD: z
    .string()
    .min(8, 'POCKETBASE_ADMIN_PASSWORD must be at least 8 characters')
    .optional(),
  
  // AI Keys (StoryWeaver Specific)
  GEMINI_API_KEY: z
    .string()
    .min(1, 'GEMINI_API_KEY is required')
    .optional(), 

  // Pagination
  ITEMS_PER_PAGE: z
    .string()
    .default('20')
    .transform((val) => parseInt(val, 10)),

  // Cache
  CACHE_DEFAULT_TTL: z
    .string()
    .default('300')
    .transform((val) => parseInt(val, 10)),
  
  CACHE_CHECK_PERIOD: z
    .string()
    .default('120')
    .transform((val) => parseInt(val, 10)),

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: z
    .string()
    .default('60000')
    .transform((val) => parseInt(val, 10)),

  RATE_LIMIT_BATCH_MAX: z
    .string()
    .default('10')
    .transform((val) => parseInt(val, 10)),

  RATE_LIMIT_STANDARD_MAX: z
    .string()
    .default('100')
    .transform((val) => parseInt(val, 10)),

  // Auth & Session
  AUTH_SESSION_MAX_AGE: z
    .string()
    .default('604800000') // 7 days
    .transform((val) => parseInt(val, 10)),

  OAUTH_STATE_MAX_AGE: z
    .string()
    .default('300000') // 5 minutes
    .transform((val) => parseInt(val, 10)),

  // Realtime & Server
  SSE_HEARTBEAT_INTERVAL: z
    .string()
    .default('30000')
    .transform((val) => parseInt(val, 10)),

  REALTIME_RECONNECT_DELAY: z
    .string()
    .default('5000')
    .transform((val) => parseInt(val, 10)),

  GRACEFUL_SHUTDOWN_TIMEOUT: z
    .string()
    .default('10000')
    .transform((val) => parseInt(val, 10)),

  // Retry
  RETRY_MAX_ATTEMPTS: z
    .string()
    .default('3')
    .transform((val) => parseInt(val, 10)),

  RETRY_BASE_DELAY: z
    .string()
    .default('500')
    .transform((val) => parseInt(val, 10)),

  RETRY_MAX_DELAY: z
    .string()
    .default('5000')
    .transform((val) => parseInt(val, 10)),

  // CORS
  ALLOWED_ORIGINS: z
    .string()
    .default('')
    .transform((val) => val.split(',').map(s => s.trim()).filter(Boolean)),
});

// =============================================================================
// Parse & Validate Environment
// =============================================================================

const parseEnv = () => {
  // Support legacy vars or override
  if (process.env['STORY_WEAVER_PORT']) {
    process.env['PORT'] = process.env['STORY_WEAVER_PORT'];
  }

  const result = envSchema.safeParse(process.env);
  
  if (!result.success) {
    const errors = result.error.issues
      .map((e) => `  - ${e.path.join('.')}: ${e.message}`)
      .join('\n');
    
    logger.error('Config', `Environment validation failed:\n${errors}`);
    
    if (process.env['NODE_ENV'] === 'production') {
      throw new Error('Environment validation failed. Check logs for details.');
    }
    
    logger.warn('Config', 'Using fallback values for missing env variables');
    return envSchema.parse({
      ...process.env,
      POCKETBASE_URL: process.env['POCKETBASE_URL'] || 'http://127.0.0.1:8090',
    });
  }
  
  return result.data;
};

const env = parseEnv();

// =============================================================================
// Exported Configuration Object
// =============================================================================

export const config = {
  /** Server port number */
  port: env.PORT,

  /** Server host address to bind to */
  host: env.HOST,
  
  /** Current environment: 'development' | 'production' | 'test' */
  nodeEnv: env.NODE_ENV,
  
  /** Frontend client URL (for CORS) */
  clientUrl: env.CLIENT_URL,
  
  /** Backend server URL (current server) */
  serverUrl: env.SERVER_URL,

  /** Main API Server URL (for permissions/auth) */
  apiServerUrl: env.API_SERVER_URL,

  /** Additional allowed CORS origins */
  allowedOrigins: env.ALLOWED_ORIGINS,
  
  /** PocketBase database URL */
  pocketbaseUrl: env.POCKETBASE_URL, 
  
  /** Legacy access for existing code */
  get pocketbase() {
    return {
        url: this.pocketbaseUrl,
        adminEmail: this.pocketbaseAdminEmail,
        adminPassword: this.pocketbaseAdminPassword
    }
  },

  /** PocketBase admin email */
  pocketbaseAdminEmail: env.POCKETBASE_ADMIN_EMAIL,
  
  /** PocketBase admin password */
  pocketbaseAdminPassword: env.POCKETBASE_ADMIN_PASSWORD,
  
  isProduction: env.NODE_ENV === 'production',
  isDevelopment: env.NODE_ENV === 'development',

  ai: {
    geminiApiKey: env.GEMINI_API_KEY,
  },

  itemsPerPage: env.ITEMS_PER_PAGE,

  cache: {
    defaultTtl: env.CACHE_DEFAULT_TTL,
    checkPeriod: env.CACHE_CHECK_PERIOD,
  },

  rateLimit: {
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    batchMax: env.RATE_LIMIT_BATCH_MAX,
    standardMax: env.RATE_LIMIT_STANDARD_MAX,
  },

  auth: {
    sessionMaxAge: env.AUTH_SESSION_MAX_AGE,
    oauthStateMaxAge: env.OAUTH_STATE_MAX_AGE,
  },

  realtime: {
    sseHeartbeatInterval: env.SSE_HEARTBEAT_INTERVAL,
    reconnectDelay: env.REALTIME_RECONNECT_DELAY,
  },

  server: {
    gracefulShutdownTimeout: env.GRACEFUL_SHUTDOWN_TIMEOUT,
  },

  retry: {
    maxAttempts: env.RETRY_MAX_ATTEMPTS,
    baseDelay: env.RETRY_BASE_DELAY,
    maxDelay: env.RETRY_MAX_DELAY,
  },
} as const;

export type Config = typeof config;
export type Env = z.infer<typeof envSchema>;
