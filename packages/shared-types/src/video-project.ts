import { z } from 'zod';
import { BaseListParams, BaseEntity } from './common.js';

// Enums
export const VIDEO_PROJECT_STATUS = {
  DRAFT: 'draft',
  GENERATING: 'generating',
  RENDERING: 'rendering',
  COMPLETED: 'completed',
} as const;

export const VIDEO_ASPECT_RATIO = {
  R_16_9: '16:9',
  R_9_16: '9:16',
  R_1_1: '1:1',
} as const;

// Zod Schemas
// Zod Schemas
export const videoProjectStatusSchema = z.enum([
  VIDEO_PROJECT_STATUS.DRAFT,
  VIDEO_PROJECT_STATUS.GENERATING,
  VIDEO_PROJECT_STATUS.RENDERING,
  VIDEO_PROJECT_STATUS.COMPLETED,
]);
export const videoAspectRatioSchema = z.enum([
  VIDEO_ASPECT_RATIO.R_16_9,
  VIDEO_ASPECT_RATIO.R_9_16,
  VIDEO_ASPECT_RATIO.R_1_1,
]);

export const videoProjectSettingsSchema = z.object({
  aspectRatio: videoAspectRatioSchema.optional().default('9:16'),
  stylePreset: z.string().optional(),
  voiceId: z.string().optional(),
});

export type VideoProjectSettings = z.infer<typeof videoProjectSettingsSchema>;

export const videoProjectSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  status: videoProjectStatusSchema,
  settings: videoProjectSettingsSchema.optional(),
  userId: z.string(),
  // BaseEntity fields
  created: z.string(),
  updated: z.string(),
  isActive: z.boolean(),
  isDeleted: z.boolean(),
});

export type VideoProject = z.infer<typeof videoProjectSchema>;

export const createVideoProjectSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  settings: videoProjectSettingsSchema.optional(),
});
export type CreateVideoProjectInput = z.infer<typeof createVideoProjectSchema>;

export const updateVideoProjectSchema = createVideoProjectSchema.partial().extend({
  status: videoProjectStatusSchema.optional(),
  isActive: z.boolean().optional(),
  isDeleted: z.boolean().optional(),
});
export type UpdateVideoProjectInput = z.infer<typeof updateVideoProjectSchema>;

export interface VideoProjectListParams extends BaseListParams {
  status?: string;
}

export const generateScriptSchema = z.object({
  topic: z.string().min(3),
});
export type GenerateScriptInput = z.infer<typeof generateScriptSchema>;

// =============================================================================
// Video Content Types
// =============================================================================

export interface VideoScript extends BaseEntity {
  projectId: string;
  content: string;
}

export interface VideoAsset extends BaseEntity {
  projectId: string;
  type: 'image' | 'video' | 'audio';
  url: string;
}

export type AIModelType = 'gemini-1.5-flash' | 'gemini-1.5-pro';
export type VideoOrientation = 'landscape' | 'portrait' | 'square';
