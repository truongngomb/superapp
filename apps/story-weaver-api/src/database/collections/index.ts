/**
 * Collections Export
 */
import { swVideoProjectsCollection } from './sw_video_projects.collection.js';
import { swVideoScenesCollection } from './sw_video_scenes.collection.js';
import { swCharactersCollection } from './sw_characters.collection.js';
import { swArtifactsCollection } from './sw_artifacts.collection.js';
import type { CollectionSchema } from '../collection.schema.js';

export * from './sw_video_projects.collection.js';
export * from './sw_video_scenes.collection.js';
export * from './sw_characters.collection.js';
export * from './sw_artifacts.collection.js';

/**
 * All collection schemas to be synced
 */
export const allCollections: CollectionSchema[] = [
  swVideoProjectsCollection,
  swVideoScenesCollection,
  swCharactersCollection,
  swArtifactsCollection,
];

/**
 * Collection names for type safety
 */
export const CollectionNames = {
  SW_VIDEO_PROJECTS: 'sw_video_projects',
  SW_VIDEO_SCENES: 'sw_video_scenes',
  SW_CHARACTERS: 'sw_characters',
  SW_ARTIFACTS: 'sw_artifacts',
} as const;

export type CollectionName = (typeof CollectionNames)[keyof typeof CollectionNames];

