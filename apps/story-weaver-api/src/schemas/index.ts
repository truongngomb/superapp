import { z } from 'zod';
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
  createVideoSceneSchema,
  updateVideoSceneSchema
} from '../types/index.js';

export const VideoProjectCreateSchema = createVideoProjectSchema;
export const VideoProjectUpdateSchema = updateVideoProjectSchema;
export const VideoProjectSettingsSchema = videoProjectSettingsSchema;

export const CharacterCreateSchema = createCharacterSchema;
export const CharacterUpdateSchema = updateCharacterSchema;

export const VideoSceneCreateSchema = createVideoSceneSchema;
export const VideoSceneUpdateSchema = updateVideoSceneSchema;

// Add other schemas as needed
