/**
 * Collections Index
 *
 * Re-exports all collection definitions and aggregates them.
 */
import type { CollectionSchema } from '../collection.schema.js';

export { usersCollection } from './users.collection.js';
export { rolesCollection } from './roles.collection.js';
export { categoriesCollection } from './categories.collection.js';
export { activity_logsCollection } from './activity_logs.collection.js';

import { usersCollection } from './users.collection.js';
import { rolesCollection } from './roles.collection.js';
import { categoriesCollection } from './categories.collection.js';
import { activity_logsCollection } from './activity_logs.collection.js';

/**
 * All collection schemas to be synced
 */
export const allCollections: CollectionSchema[] = [
  usersCollection,
  rolesCollection,
  categoriesCollection,
  activity_logsCollection,
];

/**
 * Collection names for type safety
 */
export const CollectionNames = {
  USERS: 'users',
  ROLES: 'roles',
  CATEGORIES: 'categories',
  ACTIVITY_LOGS: 'activity_logs',
} as const;

export type CollectionName = (typeof CollectionNames)[keyof typeof CollectionNames];