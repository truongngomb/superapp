/**
 * Role & Permission Types
 */
import type { Role, RolePermissions } from '@superapp/shared-types';
import type { CreateInput, UpdateInput } from './common.js';
import { PermissionResource, PermissionAction } from './common.js'; // Ensure these are value imports for usage in constants

// Re-export Role entities and Permissions
export type { Role, RolePermissions };
// Deprecated aliases - use PermissionResource and PermissionAction directly
export type Resource = PermissionResource; // Map Resource to PermissionResource enum or type
// Action was previously a type alias for PermissionAction, but now mapped to PermissionAction enum
export type Action = PermissionAction;

// Re-export constants
// Note: Shared types might define Enums, but we had object constants.
// If shared types has Enums PermissionResource, PermissionAction, we can use them or map them.
// Providing backward compatibility:

/**
 * Resource constants for type-safe usage
 */
export const Resources = {
  CATEGORIES: PermissionResource.Categories,
  USERS: PermissionResource.Users,
  ROLES: PermissionResource.Roles,
  ACTIVITY_LOGS: PermissionResource.ActivityLogs,
  DASHBOARD: PermissionResource.Dashboard,
  ALL: PermissionResource.All,
} as const;

/**
 * Action constants for type-safe usage
 */
export const Actions = {
  VIEW: PermissionAction.View,
  CREATE: PermissionAction.Create,
  UPDATE: PermissionAction.Update,
  DELETE: PermissionAction.Delete,
  MANAGE: PermissionAction.Manage,
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
