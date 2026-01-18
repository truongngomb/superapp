/**
 * Common Types & Interfaces
 * 
 * Re-exports shared types for backend usage.
 */

// Re-export common entities
export type {
  BaseEntity,
  MinimalEntity,
  Timestamps,
  ApiResponse,
  ApiErrorResponse,
  PaginatedResponse,
  PaginationParams,
  PartialBy,
  CreateInput,
  UpdateInput,
} from '@superapp/shared-types';

// Export values explicitly which can also be used as types
export { PermissionAction, PermissionResource } from '@superapp/shared-types';
