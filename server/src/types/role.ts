import type { RolePermissions } from './permission.js';

export interface Role {
  id: string;
  name: string;
  description?: string;
  permissions: RolePermissions;
  created: string;
  updated: string;
}

export interface CreateRoleInput {
  name: string;
  description?: string;
  permissions: RolePermissions;
}

export interface UpdateRoleInput {
  name?: string;
  description?: string;
  permissions?: RolePermissions;
}
