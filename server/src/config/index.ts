/**
 * Config Module - Central Configuration Exports
 * 
 * Re-exports all configuration from individual modules.
 * Import from here for cleaner imports throughout the app.
 * 
 * @example
 * ```typescript
 * import { config, pb, cache, Collections } from './config/index.js';
 * ```
 */

// Environment configuration
export { config } from './env.js';
export type { Config, Env } from './env.js';

// Database (PocketBase)
export { pb, checkPocketBaseHealth, Collections } from './database.js';
export type { CollectionName } from './database.js';

// Caching
export {
  cache,
  CacheKeys,
  getOrSet,
  invalidate,
  invalidateByPattern,
  clearAll,
  cached,
} from './cache.js';
