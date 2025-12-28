/**
 * Environment Configuration
 * Centralized, typed environment variables
 */

// Environment types
type Environment = 'development' | 'production' | 'test';

interface EnvConfig {
  readonly NODE_ENV: Environment;
  readonly API_BASE_URL: string;
  readonly IS_DEV: boolean;
  readonly IS_PROD: boolean;
  readonly ENABLE_DEBUG: boolean;
}

/**
 * Get environment variable with default value
 */
function getEnvVar(key: string, defaultValue: string): string {
  return (import.meta.env[key] as string | undefined) ?? defaultValue;
}

/**
 * Environment configuration object
 */
export const env: EnvConfig = {
  NODE_ENV: (import.meta.env.MODE || 'development') as Environment,
  API_BASE_URL: getEnvVar('VITE_API_BASE_URL', '/api'),
  IS_DEV: import.meta.env.DEV,
  IS_PROD: import.meta.env.PROD,
  ENABLE_DEBUG: import.meta.env.DEV || getEnvVar('VITE_ENABLE_DEBUG', 'false') === 'true',
} as const;

/**
 * Validate required environment variables
 */
export function validateEnv(): void {
  const required: (keyof EnvConfig)[] = [];
  
  for (const key of required) {
    if (!env[key]) {
      throw new Error(`Missing required environment variable: ${key}`);
    }
  }
}

// Validate on import in development
if (env.IS_DEV) {
  validateEnv();
}
