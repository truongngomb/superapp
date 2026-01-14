/**
 * Role Types
 */

import type { BaseEntity, PaginatedResponse } from './common.js';
import { PermissionAction, PermissionResource } from './common.js';

// ============================================================================
// Entity
// ============================================================================

/**
 * Available resources in the system
 */
export type Resource = 'categories' | 'users' | 'roles' | 'activity_logs' | 'dashboard' | 'all';

/**
 * Available actions on resources
 */
export type Action = 'view' | 'create' | 'update' | 'delete' | 'manage';

/**
 * Permission map: resource -> actions[]
 */
export interface RolePermissions {
  [resource: string]: Action[];
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
export interface RoleListParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
  search?: string;
  isActive?: boolean;
  isDeleted?: boolean;
}

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

  const hasAction = (actions: Action[] | undefined, act: string) => 
    actions?.some(a => a === act || a === 'manage') ?? false;

  return (
    hasAction(resourcePerms, action as Action) ||
    hasAction(allPerms, action as Action)
  );
}
