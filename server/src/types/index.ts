/**
 * Types Module - Central Type Exports
 * 
 * Re-exports all types from individual modules.
 * Import from here for cleaner imports throughout the app.
 * 
 * @example
 * ```typescript
 * import type { BaseEntity, Category, Role, AuthUser } from './types/index.js';
 * import { Resources, Actions } from './types/index.js';
 * ```
 */

// Common types
export type {
  BaseEntity,
  Timestamps,
  ApiResponse,
  ApiErrorResponse,
  PaginatedResponse,
  PaginationParams,
  PartialBy,
  CreateInput,
  UpdateInput,
} from './common.js';

// Category types
export type {
  Category,
  CategoryCreateInput,
  CategoryUpdateInput,
} from './category.js';

// Role & Permission types
export type {
  Resource,
  Action,
  RolePermissions,
  Role,
  RoleCreateInput,
  RoleUpdateInput,
} from './role.js';
export { Resources, Actions } from './role.js';

// User & Auth types
export type {
  User,
  AuthUser,
  UserSession,
  AuthResult,
} from './user.js';
