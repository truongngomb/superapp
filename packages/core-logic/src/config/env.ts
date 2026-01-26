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
  
  // Pagination
  readonly DEFAULT_PAGE_SIZE: number;
  readonly MAX_PAGE_SIZE: number;
  readonly NOTIFICATION_LIMIT: number;

  // API Timing
  readonly API_REQUEST_TIMEOUT: number;
  readonly API_RETRY_DELAY: number;

  // UI Timing
  readonly DEBOUNCE_DELAY: number;

  // Connection
  readonly POCKETBASE_URL: string;
}

/**
 * Safe environment access helper
 */
const getEnvSource = (): Record<string, unknown> => {
  try {
    if (typeof process !== 'undefined') {
      return process.env as unknown as Record<string, unknown>;
    }
  } catch {
    // Ignore ReferenceError for process in browsers
  }
  
  try {
    // Use a safer check for import.meta.env
    const meta: unknown = import.meta;
    if (meta && typeof meta === 'object' && 'env' in meta) {
      return (meta as { env: Record<string, unknown> }).env;
    }
  } catch {
    // Ignore ReferenceError for import.meta in old Node versions
  }

  return {};
};

const envSource = getEnvSource();

/**
 * Get environment variable with default value
 */
function getEnvVar(key: string, defaultValue: string): string {
  const value = envSource[key];
  return typeof value === 'string' ? value : defaultValue;
}

/**
 * Get boolean environment variable
 */
function getBoolEnvVar(key: string, defaultValue: boolean): boolean {
  const value = envSource[key];
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') return value === 'true';
  return defaultValue;
}

const currentMode = (
  (envSource.MODE as string | undefined) || 
  (envSource.NODE_ENV as string | undefined) || 
  'development'
) as Environment;

/**
 * Environment configuration object
 */
export const env: EnvConfig = {
  NODE_ENV: currentMode,
  API_BASE_URL: getEnvVar('VITE_API_BASE_URL', '/api'),
  IS_DEV: getBoolEnvVar('DEV', currentMode === 'development'),
  IS_PROD: getBoolEnvVar('PROD', currentMode === 'production'),
  ENABLE_DEBUG: getBoolEnvVar('DEV', currentMode === 'development') || getEnvVar('VITE_ENABLE_DEBUG', 'false') === 'true',
  
  // Pagination
  DEFAULT_PAGE_SIZE: parseInt(getEnvVar('VITE_DEFAULT_PAGE_SIZE', '20'), 10),
  MAX_PAGE_SIZE: parseInt(getEnvVar('VITE_MAX_PAGE_SIZE', '100'), 10),
  NOTIFICATION_LIMIT: parseInt(getEnvVar('VITE_NOTIFICATION_LIMIT', '10'), 10),

  // API Timing
  API_REQUEST_TIMEOUT: parseInt(getEnvVar('VITE_API_REQUEST_TIMEOUT', '10000'), 10),
  API_RETRY_DELAY: parseInt(getEnvVar('VITE_API_RETRY_DELAY', '1000'), 10),

  // UI Timing
  DEBOUNCE_DELAY: parseInt(getEnvVar('VITE_DEBOUNCE_DELAY', '400'), 10),

  // Connection
  POCKETBASE_URL: getEnvVar('VITE_POCKETBASE_URL', typeof window !== 'undefined' ? window.location.origin : ''),
} as const;

/**
 * Validate required environment variables
 */
export function validateEnv(): void {
  // Add required validations here if needed
}
