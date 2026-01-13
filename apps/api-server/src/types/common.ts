/**
 * Common Types & Interfaces
 * 
 * Shared types used across the application.
 */

// =============================================================================
// Base Types
// =============================================================================

/**
 * Base entity interface for all database records
 * All PocketBase records have these fields
 */
export interface BaseEntity {
  /** Unique identifier */
  id: string;
  /** ISO timestamp of creation */
  created: string;
  /** ISO timestamp of last update */
  updated: string;
  /** Active status flag */
  isActive: boolean;
  /** Soft delete flag */
  isDeleted: boolean;
}

/**
 * Minimal entity interface for entities that only need id and created
 * Used for entities like ActivityLog that don't need full CRUD support
 */
export interface MinimalEntity {
  /** Unique identifier */
  id: string;
  /** ISO timestamp of creation */
  created: string;
}

/**
 * Timestamps only (for entities that don't need id in context)
 */
export type Timestamps = Pick<BaseEntity, 'created' | 'updated'>;

// =============================================================================
// API Response Types
// =============================================================================

/**
 * Standard API success response
 */
export interface ApiResponse<T = unknown> {
  success: true;
  data: T;
  message?: string;
}

/**
 * Standard API error response
 */
export interface ApiErrorResponse {
  success: false;
  message: string;
  /** Error code for client-side handling */
  code?: string;
  /** Stack trace (development only) */
  stack?: string;
}

/**
 * Paginated API response
 */
export interface PaginatedResponse<T> {
  success: true;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Pagination query parameters
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

// =============================================================================
// Utility Types
// =============================================================================

/**
 * Make selected properties optional
 */
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/**
 * Input type for creating entities (omits auto-generated fields)
 */
export type CreateInput<T extends BaseEntity> = Omit<T, keyof BaseEntity>;

/**
 * Input type for updating entities (partial, omits auto-generated fields)
 */
export type UpdateInput<T extends BaseEntity> = Partial<Omit<T, keyof BaseEntity>>;
