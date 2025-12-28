/**
 * PocketBase Database Configuration
 * 
 * Provides the PocketBase client instance and health check utilities.
 */
import PocketBase from 'pocketbase';
import { config } from './env.js';
import { logger } from '../utils/index.js';

// =============================================================================
// PocketBase Client Instance
// =============================================================================

/**
 * PocketBase client singleton
 * Configured with URL from environment variables
 */
export const pb = new PocketBase(config.pocketbaseUrl);

// Disable auto-cancellation for concurrent requests
pb.autoCancellation(false);

// =============================================================================
// Health Check
// =============================================================================

/**
 * Check if PocketBase server is available
 * 
 * @param retries - Number of retry attempts (default: 3)
 * @param delay - Delay between retries in ms (default: 500)
 * @returns Promise<boolean> - true if healthy, false otherwise
 */
export async function checkPocketBaseHealth(
  retries = 3,
  delay = 500
): Promise<boolean> {
  for (let i = 0; i < retries; i++) {
    try {
      await pb.health.check();
      return true;
    } catch {
      if (i === retries - 1) {
        logger.warn(
          'Database',
          `PocketBase server not available at ${config.pocketbaseUrl}`
        );
        return false;
      }
      // Wait before retry
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  return false;
}

// =============================================================================
// Collection Names
// =============================================================================

/**
 * PocketBase collection names
 * Use these constants to avoid typos and enable refactoring
 */
export const Collections = {
  USERS: 'users',
  CATEGORIES: 'categories',
  ROLES: 'roles',
} as const;

/** Union type of all collection names */
export type CollectionName = (typeof Collections)[keyof typeof Collections];
