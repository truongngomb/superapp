import { z } from 'zod';

export const videoSceneSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  order: z.number(),
  scriptText: z.string().optional(),
  visualPrompt: z.string().optional(),
  imageUrl: z.string().optional(),
  audioUrl: z.string().optional(),
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
  projectId: z.string(),
  order: z.number(),
  scriptText: z.string().optional(),
  visualPrompt: z.string().optional(),
  duration: z.number().optional(),
  transition: z.string().optional(),
});
export type CreateVideoSceneInput = z.infer<typeof createVideoSceneSchema>;

export const updateVideoSceneSchema = createVideoSceneSchema.partial().omit({ projectId: true }).extend({
    isActive: z.boolean().optional(),
    isDeleted: z.boolean().optional(),
});
export type UpdateVideoSceneInput = z.infer<typeof updateVideoSceneSchema>;

export interface VideoSceneListParams {
    projectId: string;
}
