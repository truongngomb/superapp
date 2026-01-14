/**
 * Role Service
 * Handles all role-related API calls
 */

import { api, createAbortController, API_ENDPOINTS, type RequestConfig, env } from '@/config';
import type { Role, CreateRoleInput, UpdateRoleInput, RoleListParams, PaginatedRoles } from '@superapp/shared-types';

// ============================================================================
// Types
// ============================================================================

interface ServiceConfig extends Omit<RequestConfig, 'signal'> {
  /** Request timeout in ms (default: env.API_REQUEST_TIMEOUT) */
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
    const { controller, clear } = createAbortController(config?.timeout ?? env.API_REQUEST_TIMEOUT);
    
    try {
      return await api.get<Role[]>(API_ENDPOINTS.ROLES, {
        signal: config?.signal ?? controller.signal,
      });
    } finally {
      clear();
    }
  },

  /**
   * Get paginated roles
   */
  async getPage(params?: RoleListParams, config?: ServiceConfig): Promise<PaginatedRoles> {
    const { controller, clear } = createAbortController(config?.timeout ?? env.API_REQUEST_TIMEOUT);
    
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.sort) queryParams.append('sort', params.sort);
      if (params?.order) queryParams.append('order', params.order);
      if (params?.search) queryParams.append('search', params.search);
      if (params?.isActive !== undefined) queryParams.append('isActive', params.isActive.toString());
      if (params?.isDeleted !== undefined) queryParams.append('isDeleted', params.isDeleted.toString());

      const queryString = queryParams.toString();
      const endpoint = queryString ? `${API_ENDPOINTS.ROLES}?${queryString}` : API_ENDPOINTS.ROLES;

      return await api.get<PaginatedRoles>(endpoint, {
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
    const { controller, clear } = createAbortController(config?.timeout ?? env.API_REQUEST_TIMEOUT);
    
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

  /**
   * Delete multiple roles
   */
  async deleteMany(ids: string[]): Promise<void> {
    await api.post(`${API_ENDPOINTS.ROLES}/batch-delete`, { ids });
  },

  /**
   * Update status for multiple roles
   */
  async batchUpdateStatus(ids: string[], isActive: boolean): Promise<void> {
    await api.post(`${API_ENDPOINTS.ROLES}/batch-status`, { ids, isActive });
  },

  /**
   * Restore a role
   */
  async restore(id: string): Promise<void> {
    await api.post(`${API_ENDPOINTS.ROLES}/${id}/restore`);
  },

  /**
   * Restore multiple roles
   */
  async restoreMany(ids: string[]): Promise<void> {
    await api.post(`${API_ENDPOINTS.ROLES}/batch-restore`, { ids });
  },

  /**
   * Get all roles for export
   */
  async getAllForExport(params?: RoleListParams): Promise<Role[]> {
    const queryParams = new URLSearchParams();
    if (params?.sort) queryParams.append('sort', params.sort);
    if (params?.order) queryParams.append('order', params.order);
    if (params?.search) queryParams.append('search', params.search);
    if (params?.isActive !== undefined) queryParams.append('isActive', params.isActive.toString());
    if (params?.isDeleted !== undefined) queryParams.append('isDeleted', params.isDeleted.toString());

    const queryString = queryParams.toString();
    const endpoint = queryString ? `${API_ENDPOINTS.ROLES}/export?${queryString}` : `${API_ENDPOINTS.ROLES}/export`;

    return api.get<Role[]>(endpoint);
  },
};
