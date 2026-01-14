/**
 * Role & Permission Types
 */
import type { Role } from '@superapp/shared-types';
import type { CreateInput, UpdateInput } from './common.js';

// Re-export Role entities and Permissions
export type {
  Role,
  RolePermissions,
  Resource,
  Action
} from '@superapp/shared-types';

// Re-export constants
// Note: Shared types might define Enums, but we had object constants.
// If shared types has Enums PermissionResource, PermissionAction, we can use them or map them.
// Providing backward compatibility:

/**
 * Resource constants for type-safe usage
 */
export const Resources = {
  CATEGORIES: 'categories',
  USERS: 'users',
  ROLES: 'roles',
  ACTIVITY_LOGS: 'activity_logs',
  DASHBOARD: 'dashboard',
  ALL: 'all',
} as const;

/**
 * Action constants for type-safe usage
 */
export const Actions = {
  VIEW: 'view',
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete',
  MANAGE: 'manage',
} as const;


// =============================================================================
// Role Input Types
// =============================================================================

/**
 * Input for creating a new role
 */
export type RoleCreateInput = CreateInput<Role>;

/**
 * Input for updating an existing role
 */
export type RoleUpdateInput = UpdateInput<Role>;

/**
 * @deprecated Use RoleCreateInput instead
 */
export type CreateRoleInput = RoleCreateInput;

/**
 * @deprecated Use RoleUpdateInput instead
 */
export type UpdateRoleInput = RoleUpdateInput;
