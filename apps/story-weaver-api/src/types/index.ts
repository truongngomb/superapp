/**
 * Types Module - Central Type Exports
 */

import { 
    VideoProject as SharedVideoProject,
    CreateVideoProjectInput as SharedCreateVideoProjectInput,
    UpdateVideoProjectInput as SharedUpdateVideoProjectInput,
    User as SharedUser,
    VIDEO_PROJECT_STATUS as SHARED_VIDEO_PROJECT_STATUS,
    VIDEO_ASPECT_RATIO as SHARED_VIDEO_ASPECT_RATIO,
    VideoScript as SharedVideoScript,
    VideoAsset as SharedVideoAsset,
    AIModelType as SharedAIModelType,
    VideoOrientation as SharedVideoOrientation
} from '@superapp/shared-types';

// =============================================================================
// Common Types
// =============================================================================

// Re-export shared types for basic constructs
export type {
  BaseEntity,
  MinimalEntity,
  ApiResponse,
  ApiErrorResponse,
} from '@superapp/shared-types';

// =============================================================================
// Video Project Types (Locally Defined / Mapped)
// =============================================================================

// Use Shared Types where possible
export type VideoProject = SharedVideoProject;
export type CreateVideoProjectInput = SharedCreateVideoProjectInput;
export type UpdateVideoProjectInput = SharedUpdateVideoProjectInput;
export type User = SharedUser;

export const VIDEO_PROJECT_STATUS = SHARED_VIDEO_PROJECT_STATUS;
export const VIDEO_ASPECT_RATIO = SHARED_VIDEO_ASPECT_RATIO;

// =============================================================================
// Domain Types (Mapped from shared-types)
// =============================================================================

export type VideoScript = SharedVideoScript;
export type VideoAsset = SharedVideoAsset;
export type AIModelType = SharedAIModelType;
export type VideoOrientation = SharedVideoOrientation;
