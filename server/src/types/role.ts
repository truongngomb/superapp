/**
 * Role & Permission Types
 */
import type { BaseEntity, CreateInput, UpdateInput } from './common.js';

// =============================================================================
// Permission Types
// =============================================================================

/**
 * Available resources in the system
 */
export type Resource = 'categories' | 'users' | 'roles' | 'activity_logs' | 'all';

/**
 * Available actions on resources
 */
export type Action = 'view' | 'create' | 'update' | 'delete' | 'manage';

/**
 * Resource constants for type-safe usage
 */
export const Resources = {
  CATEGORIES: 'categories',
  USERS: 'users',
  ROLES: 'roles',
  ACTIVITY_LOGS: 'activity_logs',
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

/**
 * Role permissions mapping
 * Maps resources to allowed actions
 * 
 * @example
 * ```typescript
 * const adminPermissions: RolePermissions = {
 *   all: ['manage'],
 * };
 * 
 * const editorPermissions: RolePermissions = {
 *   categories: ['view', 'create', 'update'],
 *   users: ['view'],
 * };
 * ```
 */
export interface RolePermissions {
  [resource: string]: Action[];
}

// =============================================================================
// Role Entity
// =============================================================================

/**
 * Role entity representing a user role with permissions
 */
export interface Role extends BaseEntity {
  /** Role display name */
  name: string;
  /** Role description */
  description?: string;
  /** Permissions assigned to this role */
  permissions: RolePermissions;
}

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
