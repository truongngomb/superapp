/**
 * Types Module - Central Type Exports
 */

import { 
    VideoProject as SharedVideoProject,
    CreateVideoProjectInput as SharedCreateVideoProjectInput,
    UpdateVideoProjectInput as SharedUpdateVideoProjectInput,
    User as SharedUser
} from '@superapp/shared-types';

// =============================================================================
// Common Types
// =============================================================================

export type MinimalEntity = {
  id: string;
  created: string;
  updated: string;
  [key: string]: unknown;
};

// Re-export shared types for basic constructs
export type {
  BaseEntity,
  ApiResponse,
  ApiErrorResponse,
} from '@superapp/shared-types';

// =============================================================================
// Video Project Types (Locally Defined / Mapped)
// =============================================================================

// Use Shared Types where possible, but allow local override if needed
// For now, mapping directly to shared-types to match Zod schemas
export type VideoProject = SharedVideoProject;
export type CreateVideoProjectInput = SharedCreateVideoProjectInput;
export type UpdateVideoProjectInput = SharedUpdateVideoProjectInput;
export type User = SharedUser;

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

// =============================================================================
// Placeholder Types (To be fully defined as we migrate features)
// =============================================================================

export interface VideoScript extends MinimalEntity {
  projectId: string;
  content: string;
  scenes: unknown[]; // TODO: Define Scene type
}

export interface VideoAsset extends MinimalEntity {
  projectId: string;
  type: 'image' | 'video' | 'audio';
  url: string;
}

export type AIModelType = 'gemini-1.5-flash' | 'gemini-1.5-pro';
export type VideoOrientation = 'landscape' | 'portrait' | 'square';
