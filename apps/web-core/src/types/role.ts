/**
 * Role Types
 */

import type { BaseEntity, PaginatedResponse } from './common';
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
  const resourcePerms = role.permissions[resource] || [];
  const allPerms = role.permissions[PermissionResource.All] || [];

  return (
    resourcePerms.includes(action) ||
    resourcePerms.includes(PermissionAction.Manage) ||
    allPerms.includes(PermissionAction.Manage)
  );
}

