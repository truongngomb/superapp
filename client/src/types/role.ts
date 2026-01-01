/**
 * Role Types
 */

import type { BaseEntity } from './common';
import { PermissionAction, PermissionResource } from './common';

// ============================================================================
// Entity
// ============================================================================

/**
 * Permission map: resource -> actions[]
 */
export type RolePermissions = Record<string, string[]>;

/**
 * Role entity from API
 */
export interface Role extends BaseEntity {
  name: string;
  description?: string;
  permissions: RolePermissions;
  isActive?: boolean;
}

// ============================================================================
// Input/DTO Types
// ============================================================================

/**
 * Create role input
 */
export interface CreateRoleInput {
  name: string;
  description?: string;
  permissions: RolePermissions;
  isActive?: boolean;
}

/**
 * Update role input (all fields optional)
 */
export interface UpdateRoleInput {
  name?: string;
  description?: string;
  permissions?: RolePermissions;
  isActive?: boolean;
}

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
  const resourcePerms = role.permissions[resource] || [];
  const allPerms = role.permissions[PermissionResource.All] || [];

  return (
    resourcePerms.includes(action) ||
    resourcePerms.includes(PermissionAction.Manage) ||
    allPerms.includes(PermissionAction.Manage)
  );
}
