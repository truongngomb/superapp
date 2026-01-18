/**
 * Role Types
 */

import type { BaseEntity, PaginatedResponse, BaseListParams } from './common.js';
import { PermissionAction, PermissionResource } from './common.js';

// ============================================================================
// Entity
// ============================================================================

/**
 * Available resources in the system
 * @deprecated Use PermissionResource from common.ts instead
 */
export type Resource = PermissionResource;

/**
 * Available actions on resources
 * @deprecated Use PermissionAction from common.ts instead
 */
export type Action = PermissionAction;

/**
 * Permission map: resource -> actions[]
 */
export interface RolePermissions {
  [resource: string]: PermissionAction[];
}

/**
 * Role entity from API
 */
export interface Role extends BaseEntity {
  name: string;
  description?: string;
  permissions: RolePermissions;
}

// ============================================================================
// Input/DTO Types
// ============================================================================

/**
 * Create role input
 */
export interface RoleCreateInput {
  name: string;
  description?: string;
  permissions: RolePermissions;
  isActive?: boolean;
}

// Deprecated alias for backward compatibility
export type CreateRoleInput = RoleCreateInput;


/**
 * Update role input (all fields optional)
 */
export interface RoleUpdateInput {
  name?: string;
  description?: string;
  permissions?: RolePermissions;
  isActive?: boolean;
}

// Deprecated alias for backward compatibility
export type UpdateRoleInput = RoleUpdateInput;

// ============================================================================
// Query Types
// ============================================================================

/**
 * Role list parameters for pagination and sorting
 */
export type RoleListParams = BaseListParams;

/**
 * Paginated role response
 */
export type PaginatedRoles = PaginatedResponse<Role>;

// ============================================================================
// Permission Helpers
// ============================================================================

/**
 * Check if role has specific permission
 */
export function hasPermission(
  role: Role,
  resource: PermissionResource | string,
  action: PermissionAction | string
): boolean {
  const resourcePerms = role.permissions[resource];
  const allPerms = role.permissions[PermissionResource.All];

  const hasAction = (actions: PermissionAction[] | undefined, act: PermissionAction | string) => 
    actions?.some(a => a === (act as PermissionAction) || a === PermissionAction.Manage) ?? false;

  return (
    hasAction(resourcePerms, action) ||
    hasAction(allPerms, action)
  );
}
