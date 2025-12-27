import NodeCache from 'node-cache';

/**
 * Application cache using node-cache
 * Default TTL: 5 minutes
 * Check period: 2 minutes
 */
export const cache = new NodeCache({
  stdTTL: 300, // 5 minutes
  checkperiod: 120, // 2 minutes
  useClones: false, // For better performance with objects
});

/**
 * Cache decorator for async functions
 */
export function cached<T>(key: string, ttl?: number) {
  return function(
    _target: unknown,
    _propertyKey: string,
    descriptor: PropertyDescriptor
  ): PropertyDescriptor {
    const originalMethod = descriptor.value as (...args: unknown[]) => Promise<T>;

    descriptor.value = async function(...args: unknown[]): Promise<T> {
      const cachedValue = cache.get<T>(key);
      if (cachedValue !== undefined) {
        return cachedValue;
      }

      const result = await originalMethod.apply(this, args);
      if (ttl !== undefined) {
        cache.set(key, result, ttl);
      } else {
        cache.set(key, result);
      }
      return result;
    };

    return descriptor;
  };
}

/**
 * Get or set cache value
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
  if (ttl !== undefined) {
    cache.set(key, value, ttl);
  } else {
    cache.set(key, value);
  }
  return value;
}

/**
 * Invalidate cache by key pattern
 */
export function invalidateByPattern(pattern: string): void {
  const keys = cache.keys();
  keys.forEach((key: string) => {
    if (key.startsWith(pattern)) {
      cache.del(key);
    }
  });
}
