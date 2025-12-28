import PocketBase from 'pocketbase';
import { logger } from '../utils/index.js';

/**
 * PocketBase client instance
 * Configure the URL based on your PocketBase server
 */
const POCKETBASE_URL = process.env['POCKETBASE_URL'];

if (!POCKETBASE_URL) {
  throw new Error('POCKETBASE_URL environment variable is required');
}

export const pb = new PocketBase(POCKETBASE_URL);

// Optionally authenticate as admin
// pb.admins.authWithPassword('admin@example.com', 'password');

/**
 * Check if PocketBase is available
 */
export async function checkPocketBaseHealth(retries = 3, delay = 500): Promise<boolean> {
  for (let i = 0; i < retries; i++) {
    try {
      await pb.health.check();
      return true;
    } catch (error) {
      if (i === retries - 1) {
        logger.warn('Database', 'PocketBase server not available at', POCKETBASE_URL);
        return false;
      }
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  return false;
}

/**
 * Collection names
 */
export const Collections = {
  CATEGORIES: 'categories',
  USERS: 'users',
  ROLES: 'roles',
} as const;

export type CollectionName = typeof Collections[keyof typeof Collections];
