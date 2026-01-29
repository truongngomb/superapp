import { z } from 'zod';

// =============================================================================
// Artifact Types & Status (BRIEF 4.1)
// =============================================================================

export const ARTIFACT_TYPE = {
  CHARACTER_DESC: 'character_desc',
  MASTER_PORTRAIT: 'master_portrait',
  SCRIPT: 'script',
  IMAGE_PROMPT: 'image_prompt',
  KEYFRAME: 'keyframe',
  VIDEO_CLIP: 'video_clip',
  VOICE: 'voice',
} as const;

export type ArtifactType = (typeof ARTIFACT_TYPE)[keyof typeof ARTIFACT_TYPE];

export const artifactTypeSchema = z.enum([
  ARTIFACT_TYPE.CHARACTER_DESC,
  ARTIFACT_TYPE.MASTER_PORTRAIT,
  ARTIFACT_TYPE.SCRIPT,
  ARTIFACT_TYPE.IMAGE_PROMPT,
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

/**
 * Artifact entity for version tracking (BRIEF 4.1)
 * Immutable by default - changes create new versions
 */
export const artifactSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  /** Type of artifact */
  type: artifactTypeSchema,
  /** Related entity ID (characterId, sceneId, etc.) */
  entityId: z.string().optional(),
  /** Version number (increments on changes) */
  version: z.number().min(1),
  /** Artifact status */
  status: artifactStatusSchema,
  /** Artifact data (JSON structure varies by type) */
  data: z.record(z.string(), z.unknown()),
  /** Parent artifact ID for versioning chain */
  parentArtifactId: z.string().optional(),
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
  data: z.record(z.string(), z.unknown()),
  parentArtifactId: z.string().optional(),
});

export type CreateArtifactInput = z.infer<typeof createArtifactSchema>;

export const updateArtifactSchema = z.object({
  status: artifactStatusSchema.optional(),
  data: z.record(z.string(), z.unknown()).optional(),
});

export type UpdateArtifactInput = z.infer<typeof updateArtifactSchema>;

// =============================================================================
// Artifact Query
// =============================================================================

export interface ArtifactListParams {
  projectId: string;
  type?: ArtifactType;
  entityId?: string;
  status?: ArtifactStatus;
}

// =============================================================================
// Artifact Change Event (for downstream notification)
// =============================================================================

export interface ArtifactChangeEvent {
  artifactId: string;
  artifactType: ArtifactType;
  changeType: 'created' | 'updated' | 'approved' | 'locked';
  /** Downstream artifacts that may be affected */
  affectedDownstream?: string[];
}
