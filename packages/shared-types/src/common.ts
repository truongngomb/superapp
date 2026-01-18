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
  sort?: string;
  order?: 'asc' | 'desc';
}

/**
 * Paginated response from API (UI friendly structure)
 */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext?: boolean;
  hasPrev?: boolean;
}

/**
 * Standard API Response Structure (Backend DTO)
 */
export interface ApiResponse<T = unknown> {
  success: true;
  data: T;
  message?: string;
  code?: string;
}

/**
 * Standard API Error Response
 */
export interface ApiErrorResponse {
  success: false;
  message: string;
  code?: string;
  stack?: string;
}

/**
 * API Paginated Response (Backend DTO matching api-server structure)
 */
export interface ApiPaginatedResponse<T> {
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
 * Base List parameters for UI hooks (sync with PocketBase/BackEnd)
 */
export interface BaseListParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
  search?: string;
  isActive?: boolean;
  isDeleted?: boolean;
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

/**
 * Minimal entity interface (id + created)
 */
export interface MinimalEntity {
  id: string;
  created: string;
}

/**
 * Timestamps only
 */
export type Timestamps = Pick<BaseEntity, 'created' | 'updated'>;

/**
 * Input type for creating entities (omits auto-generated fields)
 */
export type CreateInput<T extends BaseEntity> = Omit<T, keyof BaseEntity>;

/**
 * Input type for updating entities (partial, omits auto-generated fields)
 */
export type UpdateInput<T extends BaseEntity> = Partial<Omit<T, keyof BaseEntity>>;



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
  MarkdownPages = 'markdown_pages',
  Dashboard = 'dashboard',
  Home = 'home',
  ApiDocs = 'api-docs',
  MarkdownManage = 'markdown_manage',
}

