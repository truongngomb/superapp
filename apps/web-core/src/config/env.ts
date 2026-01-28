/**
 * Environment Configuration
 * Centralized, typed environment variables
 */

import type { Environment, EnvConfig } from '@superapp/shared-types';

/**
 * Get environment variable with default value
 */
function getEnvVar(key: string, defaultValue: string): string {
  return (import.meta.env[key] as string | undefined) || defaultValue;
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
  
  // Pagination
  DEFAULT_PAGE_SIZE: parseInt(getEnvVar('VITE_DEFAULT_PAGE_SIZE', '20'), 10),
  MAX_PAGE_SIZE: parseInt(getEnvVar('VITE_MAX_PAGE_SIZE', '100'), 10),

  // API Timing
  API_REQUEST_TIMEOUT: parseInt(getEnvVar('VITE_API_REQUEST_TIMEOUT', '10000'), 10),
  API_RETRY_DELAY: parseInt(getEnvVar('VITE_API_RETRY_DELAY', '1000'), 10),

  // UI Timing
  DEBOUNCE_DELAY: parseInt(getEnvVar('VITE_DEBOUNCE_DELAY', '400'), 10),
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
