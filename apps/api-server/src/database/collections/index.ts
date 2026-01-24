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
export { settingsCollection } from './settings.collection.js';
export { markdownPagesCollection } from './markdown_pages.collection.js';
export { systemMetricsSnapshotsCollection } from './system_metrics_snapshots.collection.js';
export { videoProjectsCollection } from './video_projects.collection.js';
export { videoScenesCollection } from './video_scenes.collection.js';

import { usersCollection } from './users.collection.js';
import { rolesCollection } from './roles.collection.js';
import { categoriesCollection } from './categories.collection.js';
import { activity_logsCollection } from './activity_logs.collection.js';
import { settingsCollection } from './settings.collection.js';
import { markdownPagesCollection } from './markdown_pages.collection.js';
import { mediaCollection } from './media.collection.js';
import { systemMetricsSnapshotsCollection } from './system_metrics_snapshots.collection.js';
import { videoProjectsCollection } from './video_projects.collection.js';
import { videoScenesCollection } from './video_scenes.collection.js';

/**
 * All collection schemas to be synced
 */
export const allCollections: CollectionSchema[] = [
  usersCollection,
  rolesCollection,
  categoriesCollection,
  activity_logsCollection,
  settingsCollection,
  markdownPagesCollection,
  mediaCollection,
  systemMetricsSnapshotsCollection,
  videoProjectsCollection,
  videoScenesCollection,
];

/**
 * Collection names for type safety
 */
export const CollectionNames = {
  USERS: 'users',
  ROLES: 'roles',
  CATEGORIES: 'categories',
  ACTIVITY_LOGS: 'activity_logs',
  SETTINGS: 'settings',
  MARKDOWN_PAGES: 'markdown_pages',
  MEDIA: 'media',
  SYSTEM_METRICS_SNAPSHOTS: 'system_metrics_snapshots',
  VIDEO_PROJECTS: 'video_projects',
  VIDEO_SCENES: 'video_scenes',
} as const;

export type CollectionName = (typeof CollectionNames)[keyof typeof CollectionNames];