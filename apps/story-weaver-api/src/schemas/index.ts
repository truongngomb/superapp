/**
 * Zod Schemas
 * 
 * Re-exports shared schemas for runtime use in middleware.
 */
import { 
  createVideoProjectSchema, 
  updateVideoProjectSchema,
  videoProjectSettingsSchema,
  createCharacterSchema,
  updateCharacterSchema,
  createArtifactSchema,
  updateArtifactSchema,
  createVideoSceneSchema,
  updateVideoSceneSchema
} from '../types/index.js';

// IMPORTANT: Casting to any/unknown/ZodSchema to avoid version mismatches and simplify exports
export const VideoProjectCreateSchema = createVideoProjectSchema as unknown;
export const VideoProjectUpdateSchema = updateVideoProjectSchema as unknown;
export const VideoProjectSettingsSchema = videoProjectSettingsSchema as unknown;

export const CharacterCreateSchema = createCharacterSchema as unknown;
export const CharacterUpdateSchema = updateCharacterSchema as unknown;

export const ArtifactCreateSchema = createArtifactSchema as unknown;
export const ArtifactUpdateSchema = updateArtifactSchema as unknown;

export const VideoSceneCreateSchema = createVideoSceneSchema as unknown;
export const VideoSceneUpdateSchema = updateVideoSceneSchema as unknown;
