/**
 * Environment Configuration with Zod Validation
 * 
 * This module provides type-safe environment variable parsing and validation.
 * All environment variables are validated at startup - invalid config will throw.
 */
import 'dotenv/config';
import { z } from 'zod';
import { logger } from '../utils/index.js';

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
  
  // Google OAuth (optional)
  GOOGLE_CLIENT_ID: z
    .string()
    .optional(),
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
  
  /** Google OAuth Client ID (optional) */
  googleClientId: env.GOOGLE_CLIENT_ID,
  
  /** Helper to check if running in production */
  isProduction: env.NODE_ENV === 'production',
  
  /** Helper to check if running in development */
  isDevelopment: env.NODE_ENV === 'development',
} as const;

// =============================================================================
// Type Exports
// =============================================================================

/** Configuration type - inferred from config object */
export type Config = typeof config;

/** Environment type - inferred from Zod schema */
export type Env = z.infer<typeof envSchema>;
