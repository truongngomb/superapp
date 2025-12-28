export type Resource = 'categories' | 'users' | 'roles' | 'all';
export type Action = 'view' | 'create' | 'update' | 'delete' | 'manage';

export const Resources = {
  CATEGORIES: 'categories',
  USERS: 'users',
  ROLES: 'roles',
  ALL: 'all',
} as const;

export const Actions = {
  VIEW: 'view',
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete',
  MANAGE: 'manage',
} as const;

export interface RolePermissions {
  [resource: string]: Action[];
}
