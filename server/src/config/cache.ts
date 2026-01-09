/**
 * In-Memory Cache Configuration
 * 
 * Provides caching utilities using node-cache for improved performance.
 */
import NodeCache from 'node-cache';

// =============================================================================
// Cache Configuration
// =============================================================================

/** Default TTL in seconds (5 minutes) */
const DEFAULT_TTL = 300;

/** Check period in seconds (2 minutes) */
const CHECK_PERIOD = 120;

/**
 * Application cache instance
 * 
 * Configuration:
 * - stdTTL: 5 minutes default TTL
 * - checkperiod: Check for expired keys every 2 minutes
 * - useClones: false for better performance with objects
 */
export const cache = new NodeCache({
  stdTTL: DEFAULT_TTL,
  checkperiod: CHECK_PERIOD,
  useClones: false,
});

// =============================================================================
// Cache Key Constants
// =============================================================================

/**
 * Predefined cache keys to avoid typos and enable refactoring
 */
export const CacheKeys = {
  CATEGORIES: 'categories',
  ROLES: 'roles',
  USERS: 'users',
  ACTIVITY_LOGS: 'activity_logs',
  USER_PERMISSIONS: (userId: string) => `user:${userId}:permissions`,
} as const;

// =============================================================================
// Cache Utilities
// =============================================================================

/**
 * Get value from cache or fetch and cache it
 * 
 * @param key - Cache key
 * @param fetchFn - Function to fetch data if not cached
 * @param ttl - Optional TTL in seconds (uses default if not provided)
 * @returns Cached or freshly fetched value
 * 
 * @example
 * ```typescript
 * const users = await getOrSet('users', () => fetchUsersFromDB(), 600);
 * ```
 */
export async function getOrSet<T>(
  key: string,
  fetchFn: () => Promise<T>,
  ttl?: number
): Promise<T> {
  const cached = cache.get<T>(key);
  if (cached !== undefined) {
    return cached;
  }

  const value = await fetchFn();
  cache.set(key, value, ttl ?? DEFAULT_TTL);
  return value;
}

/**
 * Invalidate all cache entries matching a prefix pattern
 * 
 * @param prefix - Key prefix to match
 * 
 * @example
 * ```typescript
 * invalidateByPattern('user:'); // Clears all user-related cache
 * ```
 */
export function invalidateByPattern(prefix: string): void {
  const keys = cache.keys();
  const keysToDelete = keys.filter((key) => key.startsWith(prefix));
  
  if (keysToDelete.length > 0) {
    cache.del(keysToDelete);
  }
}

/**
 * Invalidate a specific cache key
 * 
 * @param key - Cache key to invalidate
 */
export function invalidate(key: string): void {
  cache.del(key);
}

/**
 * Clear all cached data
 */
export function clearAll(): void {
  cache.flushAll();
}

// =============================================================================
// Cache Decorator (for class methods)
// =============================================================================

/**
 * Decorator to cache method results
 * 
 * @param key - Cache key
 * @param ttl - Optional TTL in seconds
 * 
 * @example
 * ```typescript
 * class UserService {
 *   @cached('all-users', 600)
 *   async getAllUsers() { ... }
 * }
 * ```
 */
// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
export function cached<T>(key: string, ttl?: number) {
  return function (
    _target: unknown,
    _propertyKey: string,
    descriptor: PropertyDescriptor
  ): PropertyDescriptor {
    const originalMethod = descriptor.value as (...args: unknown[]) => Promise<T>;

    descriptor.value = async function (...args: unknown[]): Promise<T> {
      const cachedValue = cache.get<T>(key);
      if (cachedValue !== undefined) {
        return cachedValue;
      }

      const result = await originalMethod.apply(this, args);
      cache.set(key, result, ttl ?? DEFAULT_TTL);
      return result;
    };

    return descriptor;
  };
}
