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
} from '@superapp/shared-types';

// Re-export API response types
// Aliasing ApiPaginatedResponse to PaginatedResponse for backend usage to match existing code
export type {
  ApiResponse,
  ApiErrorResponse,
  ApiPaginatedResponse as PaginatedResponse,
  PaginationParams,
} from '@superapp/shared-types';

// Re-export Utility types
export type {
  PartialBy,
} from '@superapp/shared-types';

// Create generic Input types based on Shared Types utilities NOT yet existing there?
// Shared Types doesn't have generic CreateInput/UpdateInput utility types exported explicitly
// So we redefine them here using shared-types BaseEntity
import type { BaseEntity } from '@superapp/shared-types';

/**
 * Input type for creating entities (omits auto-generated fields)
 */
export type CreateInput<T extends BaseEntity> = Omit<T, keyof BaseEntity>;

/**
 * Input type for updating entities (partial, omits auto-generated fields)
 */
export type UpdateInput<T extends BaseEntity> = Partial<Omit<T, keyof BaseEntity>>;
