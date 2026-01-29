import { z } from 'zod';
import { type BaseListParams, type BaseEntity } from '@superapp/shared-types';
import { targetPlatformSchema, aspectRatioSchema } from './platform.js';

// =============================================================================
// Status & Phase Enums
// =============================================================================

export const VIDEO_PROJECT_STATUS = {
  DRAFT: 'draft',
  GENERATING: 'generating',
  RENDERING: 'rendering',
  COMPLETED: 'completed',
} as const;

export type VideoProjectStatus = (typeof VIDEO_PROJECT_STATUS)[keyof typeof VIDEO_PROJECT_STATUS];

export const PROJECT_PHASE = {
  INITIATION: 'initiation',
  CHARACTERS: 'characters',
  SCRIPTING: 'scripting',
  VISUALIZATION: 'visualization',
  MOTION: 'motion',
  RENDERING: 'rendering',
} as const;

export type ProjectPhase = (typeof PROJECT_PHASE)[keyof typeof PROJECT_PHASE];

// =============================================================================
// Zod Schemas
// =============================================================================

export const videoProjectStatusSchema = z.enum([
  VIDEO_PROJECT_STATUS.DRAFT,
  VIDEO_PROJECT_STATUS.GENERATING,
  VIDEO_PROJECT_STATUS.RENDERING,
  VIDEO_PROJECT_STATUS.COMPLETED,
]);

export const projectPhaseSchema = z.enum([
  PROJECT_PHASE.INITIATION,
  PROJECT_PHASE.CHARACTERS,
  PROJECT_PHASE.SCRIPTING,
  PROJECT_PHASE.VISUALIZATION,
  PROJECT_PHASE.MOTION,
  PROJECT_PHASE.RENDERING,
]);

// Legacy - for backwards compatibility
export const VIDEO_ASPECT_RATIO = {
  R_16_9: '16:9',
  R_9_16: '9:16',
  R_1_1: '1:1',
} as const;
export const videoAspectRatioSchema = z.enum([
  VIDEO_ASPECT_RATIO.R_16_9,
  VIDEO_ASPECT_RATIO.R_9_16,
  VIDEO_ASPECT_RATIO.R_1_1,
]);

export const videoProjectSettingsSchema = z.object({
  aspectRatio: aspectRatioSchema.optional(),
  stylePreset: z.string().optional(),
  voiceId: z.string().optional(),
});

export type VideoProjectSettings = z.infer<typeof videoProjectSettingsSchema>;

// =============================================================================
// Video Project Schema (Extended for AI Workflow)
// =============================================================================

export const videoProjectSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  status: videoProjectStatusSchema,
  settings: videoProjectSettingsSchema.optional(),
  userId: z.string(),
  
  // NEW: AI Video Workflow Fields
  storyContent: z.string().optional(),
  aspectRatio: aspectRatioSchema.optional(),
  targetPlatform: targetPlatformSchema.optional(),
  targetDuration: z.number().optional(),
  currentPhase: projectPhaseSchema.optional(),
  
  // Output
  outputUrl: z.url().optional(),
  
  // BaseEntity fields
  created: z.string(),
  updated: z.string(),
  isActive: z.boolean(),
  isDeleted: z.boolean(),
});

export type VideoProject = z.infer<typeof videoProjectSchema>;

// =============================================================================
// Create/Update Input Schemas
// =============================================================================

export const createVideoProjectSchema = z.object({
  name: z.string().min(1, 'Project name is required'),
  description: z.string().optional(),
  settings: videoProjectSettingsSchema.optional(),
  
  // NEW: AI Video Workflow Fields
  storyContent: z.string().optional(),
  aspectRatio: aspectRatioSchema.optional(),
  targetPlatform: targetPlatformSchema.optional(),
  targetDuration: z.number().min(15).max(180).optional(),
});
export type CreateVideoProjectInput = z.infer<typeof createVideoProjectSchema>;

export const updateVideoProjectSchema = createVideoProjectSchema.partial().extend({
  status: videoProjectStatusSchema.optional(),
  currentPhase: projectPhaseSchema.optional(),
  outputUrl: z.url().optional(),
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
