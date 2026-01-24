/**
 * Zod Schemas
 * 
 * Re-exports shared schemas for runtime use in middleware.
 */
import { 
  createVideoProjectSchema, 
  updateVideoProjectSchema,
  videoProjectSettingsSchema
} from '@superapp/shared-types';
import { z } from 'zod';

// We can extend or modify schemas here if API needs specific validation logic
// distinct from shared types.

// IMPORTANT: We need to cast these to ZodSchema because shared-types might be using a different Zod version
// or instance, causing 'not assignable' errors in strict TypeScript mode.
export const VideoProjectCreateSchema = createVideoProjectSchema as unknown as z.ZodSchema;
export const VideoProjectUpdateSchema = updateVideoProjectSchema as unknown as z.ZodSchema;
export const VideoProjectSettingsSchema = videoProjectSettingsSchema as unknown as z.ZodSchema;

// Add other schemas as needed
