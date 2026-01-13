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
    .default('3000')
    .transform((val) => parseInt(val, 10))
    .refine((val) => val > 0 && val < 65536, 'PORT must be between 1 and 65535'),
  
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  
  // URLs
  CLIENT_URL: z
    .string()
    .url('CLIENT_URL must be a valid URL')
    .default('http://localhost:5173'),
  
  SERVER_URL: z
    .string()
    .url('SERVER_URL must be a valid URL')
    .default('http://localhost:3000'),
  
  // Database
  POCKETBASE_URL: z
    .string()
    .url('POCKETBASE_URL must be a valid URL'),
  
  // PocketBase Admin (for migrations)
  POCKETBASE_ADMIN_EMAIL: z
    .string()
    .email('POCKETBASE_ADMIN_EMAIL must be a valid email')
    .optional(),
  
  POCKETBASE_ADMIN_PASSWORD: z
    .string()
    .min(8, 'POCKETBASE_ADMIN_PASSWORD must be at least 8 characters')
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
});

// =============================================================================
// Parse & Validate Environment
// =============================================================================

const parseEnv = () => {
  const result = envSchema.safeParse(process.env);
  
  if (!result.success) {
    const errors = result.error.issues
      .map((e) => `  - ${e.path.join('.')}: ${e.message}`)
      .join('\n');
    
    logger.error('Config', `Environment validation failed:\n${errors}`);
    
    if (process.env['NODE_ENV'] === 'production') {
      throw new Error('Environment validation failed. Check logs for details.');
    }
    
    // In development, use defaults where possible
    logger.warn('Config', 'Using fallback values for missing env variables');
    return envSchema.parse({
      ...process.env,
      POCKETBASE_URL: process.env['POCKETBASE_URL'] || 'http://localhost:8090',
    });
  }
  
  return result.data;
};

const env = parseEnv();

// =============================================================================
// Exported Configuration Object
// =============================================================================

/**
 * Application configuration
 * All values are validated at startup
 */
export const config = {
  /** Server port number */
  port: env.PORT,
  
  /** Current environment: 'development' | 'production' | 'test' */
  nodeEnv: env.NODE_ENV,
  
  /** Frontend client URL (for CORS) */
  clientUrl: env.CLIENT_URL,
  
  /** Backend server URL (for OAuth callbacks) */
  serverUrl: env.SERVER_URL,
  
  /** PocketBase database URL */
  pocketbaseUrl: env.POCKETBASE_URL,
  
  /** PocketBase admin email for migrations */
  pocketbaseAdminEmail: env.POCKETBASE_ADMIN_EMAIL,
  
  /** PocketBase admin password for migrations */
  pocketbaseAdminPassword: env.POCKETBASE_ADMIN_PASSWORD,
  
  /** Helper to check if running in production */
  isProduction: env.NODE_ENV === 'production',
  
  /** Helper to check if running in development */
  isDevelopment: env.NODE_ENV === 'development',

  /** Default items per page */
  itemsPerPage: env.ITEMS_PER_PAGE,

  /** Cache configuration */
  cache: {
    defaultTtl: env.CACHE_DEFAULT_TTL,
    checkPeriod: env.CACHE_CHECK_PERIOD,
  },

  /** Rate limiting configuration */
  rateLimit: {
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    batchMax: env.RATE_LIMIT_BATCH_MAX,
    standardMax: env.RATE_LIMIT_STANDARD_MAX,
  },

  /** Auth & Session configuration */
  auth: {
    sessionMaxAge: env.AUTH_SESSION_MAX_AGE,
    oauthStateMaxAge: env.OAUTH_STATE_MAX_AGE,
  },

  /** Realtime & Server configuration */
  realtime: {
    sseHeartbeatInterval: env.SSE_HEARTBEAT_INTERVAL,
    reconnectDelay: env.REALTIME_RECONNECT_DELAY,
  },

  /** Server lifecycle configuration */
  server: {
    gracefulShutdownTimeout: env.GRACEFUL_SHUTDOWN_TIMEOUT,
  },

  /** Retry configuration */
  retry: {
    maxAttempts: env.RETRY_MAX_ATTEMPTS,
    baseDelay: env.RETRY_BASE_DELAY,
    maxDelay: env.RETRY_MAX_DELAY,
  },
} as const;

// =============================================================================
// Type Exports
// =============================================================================

/** Configuration type - inferred from config object */
export type Config = typeof config;

/** Environment type - inferred from Zod schema */
export type Env = z.infer<typeof envSchema>;
