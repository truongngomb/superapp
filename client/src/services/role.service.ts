import { api } from '@/config/api';
import type { Role, CreateRoleInput, UpdateRoleInput } from '@/types';

export const roleService = {
  /**
   * Get all roles
   */
  getAll: async (): Promise<Role[]> => {
    return api.get<Role[]>('/roles');
  },

  /**
   * Get role by ID
   */
  getById: async (id: string): Promise<Role> => {
    return api.get<Role>(`/roles/${id}`);
  },

  /**
   * Create new role
   */
  create: async (input: CreateRoleInput): Promise<Role> => {
    return api.post<Role>('/roles', input);
  },

  /**
   * Update role details and permissions
   */
  update: async (id: string, input: UpdateRoleInput): Promise<Role> => {
    return api.put<Role>(`/roles/${id}`, input);
  },

  /**
   * Delete role
   */
  delete: async (id: string): Promise<void> => {
    return api.delete(`/roles/${id}`);
  },
};
