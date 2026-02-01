import { z } from 'zod';
import { type BaseListParams, type BaseEntity, PROJECT_LANGUAGE } from '@superapp/shared-types';

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
  R_4_5: '4:5',
} as const;

export const VIDEO_TARGET_PLATFORM = {
  TIKTOK: 'tiktok',
  YOUTUBE_SHORTS: 'youtube_shorts',
  INSTAGRAM_REELS: 'instagram_reels',
  YOUTUBE: 'youtube',
  CUSTOM: 'custom',
} as const;

export const VIDEO_WORKFLOW_PHASE = {
  INITIATION: 'initiation',
  CHARACTERS: 'characters',
  SCRIPTING: 'scripting',
  VISUALIZATION: 'visualization',
  MOTION: 'motion',
  RENDERING: 'rendering',
} as const;

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
  VIDEO_ASPECT_RATIO.R_4_5,
]);
export const videoTargetPlatformSchema = z.enum([
  VIDEO_TARGET_PLATFORM.TIKTOK,
  VIDEO_TARGET_PLATFORM.YOUTUBE_SHORTS,
  VIDEO_TARGET_PLATFORM.INSTAGRAM_REELS,
  VIDEO_TARGET_PLATFORM.YOUTUBE,
  VIDEO_TARGET_PLATFORM.CUSTOM,
]);
export const videoWorkflowPhaseSchema = z.enum([
  VIDEO_WORKFLOW_PHASE.INITIATION,
  VIDEO_WORKFLOW_PHASE.CHARACTERS,
  VIDEO_WORKFLOW_PHASE.SCRIPTING,
  VIDEO_WORKFLOW_PHASE.VISUALIZATION,
  VIDEO_WORKFLOW_PHASE.MOTION,
  VIDEO_WORKFLOW_PHASE.RENDERING,
]);

export const videoProjectSettingsSchema = z.object({
  aspectRatio: videoAspectRatioSchema.optional(),
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
  // New Phase 1 fields
  storyContent: z.string().optional(),
  aspectRatio: videoAspectRatioSchema.optional(),
  targetPlatform: videoTargetPlatformSchema.optional(),
  targetDuration: z.number().optional(),
  currentPhase: videoWorkflowPhaseSchema.optional(),
  outputUrl: z.string().url().optional(),
  artStyleId: z.string().optional(), // New field for Art Style
  scriptLanguage: z.enum([PROJECT_LANGUAGE.VI, PROJECT_LANGUAGE.EN, PROJECT_LANGUAGE.KO]).optional(),

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
  storyContent: z.string().optional(),
  aspectRatio: videoAspectRatioSchema.optional(),
  targetPlatform: videoTargetPlatformSchema.optional(),
  targetDuration: z.number().optional(),
  settings: videoProjectSettingsSchema.optional(),
  artStyleId: z.string().optional(),
  scriptLanguage: z.enum([PROJECT_LANGUAGE.VI, PROJECT_LANGUAGE.EN, PROJECT_LANGUAGE.KO]).optional(),

});
export type CreateVideoProjectInput = z.infer<typeof createVideoProjectSchema>;

export const updateVideoProjectSchema = createVideoProjectSchema.partial().extend({
  status: videoProjectStatusSchema.optional(),
  currentPhase: videoWorkflowPhaseSchema.optional(),
  outputUrl: z.string().url().optional(),
  artStyleId: z.string().optional(),
  scriptLanguage: z.enum([PROJECT_LANGUAGE.VI, PROJECT_LANGUAGE.EN, PROJECT_LANGUAGE.KO]).optional(),

  isActive: z.boolean().optional(),
  isDeleted: z.boolean().optional(),
});
export type UpdateVideoProjectInput = z.infer<typeof updateVideoProjectSchema>;

export interface VideoProjectListParams extends BaseListParams {
  status?: string;
  currentPhase?: string;
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
