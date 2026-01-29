import { z } from 'zod';
import { type BaseListParams } from '@superapp/shared-types';

// =============================================================================
// Artifact Types & Status
// =============================================================================

export const ARTIFACT_TYPE = {
  CHARACTER_DESC: 'character_desc',
  MASTER_PORTRAIT: 'master_portrait',
  SCRIPT: 'script',
  PROMPT: 'prompt',
  KEYFRAME: 'keyframe',
  VIDEO_CLIP: 'video_clip',
  VOICE: 'voice',
} as const;

export type ArtifactType = (typeof ARTIFACT_TYPE)[keyof typeof ARTIFACT_TYPE];

export const artifactTypeSchema = z.enum([
  ARTIFACT_TYPE.CHARACTER_DESC,
  ARTIFACT_TYPE.MASTER_PORTRAIT,
  ARTIFACT_TYPE.SCRIPT,
  ARTIFACT_TYPE.PROMPT,
  ARTIFACT_TYPE.KEYFRAME,
  ARTIFACT_TYPE.VIDEO_CLIP,
  ARTIFACT_TYPE.VOICE,
]);

export const ARTIFACT_STATUS = {
  DRAFT: 'draft',
  APPROVED: 'approved',
  LOCKED: 'locked',
} as const;

export type ArtifactStatus = (typeof ARTIFACT_STATUS)[keyof typeof ARTIFACT_STATUS];

export const artifactStatusSchema = z.enum([
  ARTIFACT_STATUS.DRAFT,
  ARTIFACT_STATUS.APPROVED,
  ARTIFACT_STATUS.LOCKED,
]);

// =============================================================================
// Artifact Schema
// =============================================================================

export const artifactSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  type: artifactTypeSchema,
  entityId: z.string().optional(),
  entityType: z.string().optional(),
  version: z.number().min(1),
  status: artifactStatusSchema,
  data: z.record(z.string(), z.unknown()),
  parentArtifactId: z.string().optional(),
  userId: z.string(),
  // BaseEntity fields
  created: z.string(),
  updated: z.string(),
  isActive: z.boolean(),
  isDeleted: z.boolean(),
});

export type Artifact = z.infer<typeof artifactSchema>;

// =============================================================================
// Artifact Input Schemas
// =============================================================================

export const createArtifactSchema = z.object({
  projectId: z.string(),
  type: artifactTypeSchema,
  entityId: z.string().optional(),
  entityType: z.string().optional(),
  data: z.record(z.string(), z.unknown()),
  parentArtifactId: z.string().optional(),
  status: artifactStatusSchema.optional(),
  version: z.number().optional(),
});

export type CreateArtifactInput = z.infer<typeof createArtifactSchema>;

export const updateArtifactSchema = z.object({
  status: artifactStatusSchema.optional(),
  data: z.record(z.string(), z.unknown()).optional(),
  isActive: z.boolean().optional(),
  isDeleted: z.boolean().optional(),
});

export type UpdateArtifactInput = z.infer<typeof updateArtifactSchema>;

// =============================================================================
// Artifact List Params
// =============================================================================

export interface ArtifactListParams extends BaseListParams {
  projectId: string;
  type?: ArtifactType;
  entityId?: string;
  status?: ArtifactStatus;
}
