/**
 * Types Module - Central Type Exports
 */

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
// Video Project Types (Locally Defined)
// =============================================================================

export * from './video-project.js';
export * from './video-scene.js';
export * from './character.js';
export * from './artifact.js';

// =============================================================================
// User Types (From Shared)
// =============================================================================

export type { User } from '@superapp/shared-types';
