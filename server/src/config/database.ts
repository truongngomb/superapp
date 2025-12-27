import PocketBase from 'pocketbase';

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
export async function checkPocketBaseHealth(): Promise<boolean> {
  try {
    await pb.health.check();
    return true;
  } catch {
    console.warn('[PocketBase] Server not available at', POCKETBASE_URL);
    return false;
  }
}

/**
 * Collection names
 */
export const Collections = {
  CATEGORIES: 'categories',
  USERS: 'users',
} as const;

export type CollectionName = typeof Collections[keyof typeof Collections];
