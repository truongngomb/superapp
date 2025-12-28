/**
 * Role types
 */
export interface Role {
  id: string;
  name: string;
  description?: string;
  permissions: Record<string, string[]>;
  created: string;
  updated: string;
}

export interface CreateRoleInput {
  name: string;
  description?: string;
  permissions: Record<string, string[]>;
}

export interface UpdateRoleInput {
  name?: string;
  description?: string;
  permissions?: Record<string, string[]>;
}
