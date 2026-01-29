/**
 * Zod Schemas
 * 
 * Re-exports shared schemas for runtime use in middleware.
 */
import { 
  createVideoProjectSchema, 
  updateVideoProjectSchema,
  videoProjectSettingsSchema} from '../types/index.js';

// IMPORTANT: We need to cast these to ZodSchema because shared-types might be using a different Zod version
// or instance, causing 'not assignable' errors in strict TypeScript mode.
export const VideoProjectCreateSchema = createVideoProjectSchema as unknown as z.ZodSchema;
export const VideoProjectUpdateSchema = updateVideoProjectSchema as unknown as z.ZodSchema;
export const VideoProjectSettingsSchema = videoProjectSettingsSchema as unknown as z.ZodSchema;

// Add other schemas as needed
