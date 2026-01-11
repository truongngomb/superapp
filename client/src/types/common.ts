/**
 * Common/Shared Types
 * Reusable types used across the application
 */

// ============================================================================
// Utility Types
// ============================================================================

/**
 * Make specific properties optional
 */
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/**
 * Make specific properties required
 */
export type RequiredBy<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;

/**
 * Extract the resolved type from a Promise
 */
export type Awaited<T> = T extends Promise<infer U> ? U : T;

/**
 * Make all properties readonly recursively
 */
export type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};

// ============================================================================
// API Types
// ============================================================================

/**
 * Pagination parameters for list requests
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Paginated response from API
 */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

/**
 * Search/Filter parameters
 */
export interface SearchParams extends PaginationParams {
  query?: string;
  filters?: Record<string, unknown>;
}

// ============================================================================
// Entity Types
// ============================================================================

/**
 * Base entity with common fields
 */
export interface BaseEntity {
  id: string;
  created: string;
  updated: string;
  /** Active status flag */
  isActive: boolean;
  /** Soft delete flag */
  isDeleted: boolean;
}



// ============================================================================
// Form Types
// ============================================================================

/**
 * Form field error
 */
export interface FieldError {
  field: string;
  message: string;
  code?: string;
}

/**
 * Form validation result
 */
export interface ValidationResult {
  isValid: boolean;
  errors: FieldError[];
}

// ============================================================================
// UI Types
// ============================================================================

/**
 * Sort order direction
 */
export type SortOrder = 'asc' | 'desc' | null;

/**
 * Sort configuration for lists/tables
 */
export interface SortConfig {
  field: string;
  order: SortOrder;
}

/**
 * Sort column definition
 */
export interface SortColumn {
  field: string;
  label: string;
}

/**
 * Loading states
 */
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

/**
 * Async state wrapper
 */
export interface AsyncState<T, E = Error> {
  data: T | null;
  isLoading: boolean;
  error: E | null;
  status: LoadingState;
}

/**
 * Toast/Notification types
 */
export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

// ============================================================================
// Event Types
// ============================================================================

/**
 * Generic callback types
 */
export type VoidCallback = () => void;
export type AsyncCallback = () => Promise<void>;
export type ValueCallback<T> = (value: T) => void;
export type AsyncValueCallback<T> = (value: T) => Promise<void>;

// ============================================================================
// Enums
// ============================================================================

/**
 * Permission actions
 */
export enum PermissionAction {
  Create = 'create',
  View = 'view',
  Update = 'update',
  Delete = 'delete',
  Manage = 'manage',
}

/**
 * Permission resources
 */
export enum PermissionResource {
  All = 'all',
  Categories = 'categories',
  Roles = 'roles',
  Users = 'users',
  ActivityLogs = 'activity_logs',
  Dashboard = 'dashboard',
}
