import { z } from 'zod';

export const videoSceneSchema = z.object({
  id: z.string(),
  project_id: z.string(),
  order: z.number(),
  script_text: z.string().optional(),
  visual_prompt: z.string().optional(),
  image_url: z.string().optional(),
  audio_url: z.string().optional(),
  duration: z.number().optional(),
  transition: z.string().optional(),
  // BaseEntity fields
  created: z.string(),
  updated: z.string(),
  isActive: z.boolean(),
  isDeleted: z.boolean(),
});

export type VideoScene = z.infer<typeof videoSceneSchema>;

export const createVideoSceneSchema = z.object({
  project_id: z.string(),
  order: z.number(),
  script_text: z.string().optional(),
  visual_prompt: z.string().optional(),
  duration: z.number().optional(),
  transition: z.string().optional(),
});
export type CreateVideoSceneInput = z.infer<typeof createVideoSceneSchema>;

export const updateVideoSceneSchema = createVideoSceneSchema.partial().omit({ project_id: true }).extend({
    isActive: z.boolean().optional(),
    isDeleted: z.boolean().optional(),
});
export type UpdateVideoSceneInput = z.infer<typeof updateVideoSceneSchema>;

export interface VideoSceneListParams {
    projectId: string;
}
