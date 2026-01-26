import { config } from '../config/index.js';
import { retry as retryBase } from '@superapp/core-logic';

/**
 * Common Utility Helpers
 * Re-exports from @superapp/core-logic with API-specific adaptations
 */
export * from '@superapp/core-logic';

/**
 * Retry an async function with exponential backoff
 * Wraps core-logic retry with API server configuration defaults
 */
export const retry = <T>(
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
