import { z } from 'zod';
import { type BaseListParams } from '@superapp/shared-types';

export const CAMERA_MOVEMENTS = [
  'static',
  'pan_left',
  'pan_right',
  'zoom_in',
  'zoom_out',
  'ken_burns',
  'tilt_up',
  'tilt_down',
] as const;

export const cameraMovementSchema = z.enum(CAMERA_MOVEMENTS);

export const SCENE_STATUS = {
  DRAFT: 'draft',
  PROMPT_READY: 'prompt_ready',
  VISUAL_READY: 'visual_ready',
  VIDEO_READY: 'video_ready',
} as const;

export const sceneStatusSchema = z.enum([
  SCENE_STATUS.DRAFT,
  SCENE_STATUS.PROMPT_READY,
  SCENE_STATUS.VISUAL_READY,
  SCENE_STATUS.VIDEO_READY,
]);

export const videoSceneSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  characterIds: z.array(z.string()).optional(),
  order: z.number(),
  estimatedDuration: z.number().optional(),
  scriptText: z.string().optional(),
  voiceover: z.string().optional(),
  textOverlay: z.string().optional(),
  visualPrompt: z.string().optional(),
  cameraMovement: cameraMovementSchema.optional(),
  keyframeOptions: z.array(z.object({ url: z.string(), prompt: z.string().optional() })).optional(),
  selectedKeyframe: z.string().optional(),
  imageUrl: z.string().optional(),
  audioUrl: z.string().optional(),
  videoUrl: z.string().optional(),
  videoClipUrl: z.string().optional(),
  duration: z.number().optional(),
  status: sceneStatusSchema,
  metadata: z.record(z.string(), z.unknown()).optional(),
  // BaseEntity fields
  created: z.string(),
  updated: z.string(),
  isActive: z.boolean(),
  isDeleted: z.boolean(),
});

export type VideoScene = z.infer<typeof videoSceneSchema>;

export const createVideoSceneSchema = z.object({
  projectId: z.string(),
  characterIds: z.array(z.string()).optional(),
  order: z.number(),
  estimatedDuration: z.number().optional(),
  scriptText: z.string().optional(),
  voiceover: z.string().optional(),
  textOverlay: z.string().optional(),
  visualPrompt: z.string().optional(),
  cameraMovement: cameraMovementSchema.optional(),
  status: sceneStatusSchema.optional(),
});
export type CreateVideoSceneInput = z.infer<typeof createVideoSceneSchema>;

export const updateVideoSceneSchema = createVideoSceneSchema.partial().omit({ projectId: true }).extend({
    keyframeOptions: z.array(z.object({ url: z.string(), prompt: z.string().optional() })).optional(),
    selectedKeyframe: z.string().optional(),
    imageUrl: z.string().optional(),
    audioUrl: z.string().optional(),
    videoUrl: z.string().optional(),
    videoClipUrl: z.string().optional(),
    duration: z.number().optional(),
    isActive: z.boolean().optional(),
    isDeleted: z.boolean().optional(),
});
export type UpdateVideoSceneInput = z.infer<typeof updateVideoSceneSchema>;

export interface VideoSceneListParams extends BaseListParams {
    projectId: string;
    status?: string;
}
