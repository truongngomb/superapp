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
export const VideoProjectCreateSchema = createVideoProjectSchema as any;
export const VideoProjectUpdateSchema = updateVideoProjectSchema as any;
export const VideoProjectSettingsSchema = videoProjectSettingsSchema as any;

export const CharacterCreateSchema = createCharacterSchema as any;
export const CharacterUpdateSchema = updateCharacterSchema as any;

export const ArtifactCreateSchema = createArtifactSchema as any;
export const ArtifactUpdateSchema = updateArtifactSchema as any;

export const VideoSceneCreateSchema = createVideoSceneSchema as any;
export const VideoSceneUpdateSchema = updateVideoSceneSchema as any;
