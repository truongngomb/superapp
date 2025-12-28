/**
 * Role Service
 * Handles all role-related API calls
 */

import { api, createAbortController, API_ENDPOINTS, type RequestConfig } from '@/config';
import type { Role, CreateRoleInput, UpdateRoleInput } from '@/types';

// ============================================================================
// Types
// ============================================================================

interface ServiceConfig extends Omit<RequestConfig, 'signal'> {
  /** Request timeout in ms (default: 10000) */
  timeout?: number;
  /** AbortSignal for cancellation */
  signal?: AbortSignal;
}

// ============================================================================
// Service
// ============================================================================

export const roleService = {
  /**
   * Get all roles
   */
  async getAll(config?: ServiceConfig): Promise<Role[]> {
    const { controller, clear } = createAbortController(config?.timeout ?? 10000);
    
    try {
      return await api.get<Role[]>(API_ENDPOINTS.ROLES, {
        signal: config?.signal ?? controller.signal,
      });
    } finally {
      clear();
    }
  },

  /**
   * Get role by ID
   */
  async getById(id: string, config?: ServiceConfig): Promise<Role> {
    const { controller, clear } = createAbortController(config?.timeout ?? 10000);
    
    try {
      return await api.get<Role>(`${API_ENDPOINTS.ROLES}/${id}`, {
        signal: config?.signal ?? controller.signal,
      });
    } finally {
      clear();
    }
  },

  /**
   * Create new role
   */
  async create(data: CreateRoleInput): Promise<Role> {
    return api.post<Role>(API_ENDPOINTS.ROLES, data);
  },

  /**
   * Update role details and permissions
   */
  async update(id: string, data: UpdateRoleInput): Promise<Role> {
    return api.put<Role>(`${API_ENDPOINTS.ROLES}/${id}`, data);
  },

  /**
   * Delete role by ID
   */
  async delete(id: string): Promise<void> {
    return api.delete(`${API_ENDPOINTS.ROLES}/${id}`);
  },

  /**
   * Duplicate a role
   */
  async duplicate(id: string, newName: string): Promise<Role> {
    return api.post<Role>(`${API_ENDPOINTS.ROLES}/${id}/duplicate`, { name: newName });
  },
};
