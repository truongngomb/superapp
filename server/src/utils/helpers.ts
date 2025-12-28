/**
 * Common Utility Helpers
 */

// =============================================================================
// String Utilities
// =============================================================================

/**
 * Capitalize first letter of a string
 */
export const capitalize = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

/**
 * Convert string to slug format (lowercase, hyphens)
 */
export const slugify = (str: string): string => {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

// =============================================================================
// Object Utilities
// =============================================================================

/**
 * Remove undefined and null values from an object
 */
export const compact = <T extends Record<string, unknown>>(obj: T): Partial<T> => {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined && v !== null)
  ) as Partial<T>;
};

/**
 * Pick specific keys from an object
 */
export const pick = <T extends Record<string, unknown>, K extends keyof T>(
  obj: T,
  keys: K[]
): Pick<T, K> => {
  return keys.reduce((acc, key) => {
    if (key in obj) {
      acc[key] = obj[key];
    }
    return acc;
  }, {} as Pick<T, K>);
};

/**
 * Omit specific keys from an object
 */
export const omit = <T extends Record<string, unknown>, K extends keyof T>(
  obj: T,
  keys: K[]
): Omit<T, K> => {
  const keysSet = new Set(keys as string[]);
  return Object.fromEntries(
    Object.entries(obj).filter(([key]) => !keysSet.has(key))
  ) as Omit<T, K>;
};

// =============================================================================
// Async Utilities
// =============================================================================

/**
 * Sleep for specified milliseconds
 */
export const sleep = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

/**
 * Retry an async function with exponential backoff
 */
export const retry = async <T>(
  fn: () => Promise<T>,
  options: {
    maxRetries?: number;
    baseDelay?: number;
    maxDelay?: number;
  } = {}
): Promise<T> => {
  const { maxRetries = 3, baseDelay = 500, maxDelay = 5000 } = options;
  
  let lastError: Error | undefined;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      if (attempt < maxRetries - 1) {
        const delay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay);
        await sleep(delay);
      }
    }
  }
  
  throw lastError ?? new Error('Retry operation failed');
};

// =============================================================================
// ID Utilities
// =============================================================================

/**
 * Generate a simple unique ID (not cryptographically secure)
 * For display purposes only, not for security
 */
export const generateId = (prefix = ''): string => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return prefix ? `${prefix}_${timestamp}${random}` : `${timestamp}${random}`;
};
