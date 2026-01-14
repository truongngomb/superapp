import { config } from '../config/index.js';
import { retry as retryBase } from '@superapp/core-logic/utils/async';

/**
 * Common Utility Helpers
 * Re-exports from @superapp/core-logic with API-specific adaptations
 */

// Re-export utilities using deep paths to ensure safe resolution
export * from '@superapp/core-logic/utils/string';
export * from '@superapp/core-logic/utils/object';
export * from '@superapp/core-logic/utils/security';
export { sleep } from '@superapp/core-logic/utils/async';

/**
 * Retry an async function with exponential backoff
 * Wraps core-logic retry with API server configuration defaults
 */
export const retry = async <T>(
  fn: () => Promise<T>,
  options: {
    maxRetries?: number;
    baseDelay?: number;
    maxDelay?: number;
  } = {}
): Promise<T> => {
  const { 
    maxRetries = config.retry.maxAttempts, 
    baseDelay = config.retry.baseDelay, 
    maxDelay = config.retry.maxDelay 
  } = options;
  
  return retryBase(fn, { maxRetries, baseDelay, maxDelay });
};
