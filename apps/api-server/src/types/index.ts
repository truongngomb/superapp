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
  MinimalEntity,
  Timestamps,
  ApiResponse,
  ApiErrorResponse,
  PaginatedResponse, // Aliased to ApiPaginatedResponse
  PaginationParams,
  PartialBy,
  CreateInput,
  UpdateInput,
} from './common.js';

// Category types - imported directly from shared-types
export type {
  Category,
  CategoryCreateInput,
  CategoryUpdateInput,
} from '@superapp/shared-types';

// Role & Permission types - imported directly from shared-types
export type {
  Role,
  RoleCreateInput,
  RoleUpdateInput,
  RolePermissions,
} from '@superapp/shared-types';
// Re-export Enums
export {
  PermissionResource as Resources, // Aliased for backward compatibility if needed, though we updated controllers to use Enum directly, some might still rely on it? No, controllers use Enum.
  PermissionAction as Actions,     // But the grep showed references in routes/controllers that we might have missed or are partial matches.
  PermissionResource,
  PermissionAction,
} from '@superapp/shared-types';

// User & Auth types - imported directly from shared-types
export type {
  User,
  AuthUser,
  UserCreateInput,
  UserUpdateInput,
  UserRoleAssignment,
  UserSession,
} from '@superapp/shared-types';

// Activity Log types - imported directly from shared-types
export type {
  ActivityLog,
  ActivityLogInput,
} from '@superapp/shared-types';

