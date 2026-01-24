/**
 * Collections Export
 */
import { swVideoProjectsCollection } from './sw_video_projects.collection.js';
import { swVideoScenesCollection } from './sw_video_scenes.collection.js';
import type { CollectionSchema } from '../collection.schema.js';

export * from './sw_video_projects.collection.js';
export * from './sw_video_scenes.collection.js';

/**
 * All collection schemas to be synced
 */
export const allCollections: CollectionSchema[] = [
  swVideoProjectsCollection,
  swVideoScenesCollection,
];

/**
 * Collection names for type safety
 */
export const CollectionNames = {
  SW_VIDEO_PROJECTS: 'sw_video_projects',
  SW_VIDEO_SCENES: 'sw_video_scenes',
} as const;

export type CollectionName = (typeof CollectionNames)[keyof typeof CollectionNames];
