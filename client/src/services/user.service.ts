/**
 * User Service
 * Handles user management API calls
 */

import { api, createAbortController, API_ENDPOINTS, type RequestConfig, env } from '@/config';

import type { User, UserCreateInput, UserUpdateInput, UserRoleAssignment, PaginatedUsers, UserListParams } from '@/types';


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

export const userService = {
  /**
   * Get paginated list of users
   */
  async getPage(params?: UserListParams, config?: ServiceConfig): Promise<PaginatedUsers> {
    const { controller, clear } = createAbortController(config?.timeout ?? env.API_REQUEST_TIMEOUT);
    
    try {
      const searchParams = new URLSearchParams();
      
      if (params?.page) searchParams.append('page', String(params.page));
      if (params?.limit) searchParams.append('limit', String(params.limit));
      if (params?.sort) searchParams.append('sort', params.sort);
      if (params?.order) searchParams.append('order', params.order);
      if (params?.search) searchParams.append('search', params.search);
      if (params?.isActive !== undefined) searchParams.append('isActive', String(params.isActive));
      if (params?.isDeleted !== undefined) searchParams.append('isDeleted', String(params.isDeleted));
      
      const query = searchParams.toString();
      const endpoint = query 
        ? `${API_ENDPOINTS.USERS}?${query}` 
        : API_ENDPOINTS.USERS;
      
      return await api.get<PaginatedUsers>(endpoint, {
        signal: config?.signal ?? controller.signal,
      });
    } finally {
      clear();
    }
  },

  /**
   * Get all users for export (no pagination)
   */
  async getAllForExport(params?: Omit<UserListParams, 'page' | 'limit'>, config?: ServiceConfig): Promise<User[]> {
    const { controller, clear } = createAbortController(config?.timeout ?? env.API_REQUEST_TIMEOUT);
    
    try {
      const searchParams = new URLSearchParams();
      
      if (params?.sort) searchParams.append('sort', params.sort);
      if (params?.order) searchParams.append('order', params.order);
      if (params?.search) searchParams.append('search', params.search);
      if (params?.isActive !== undefined) searchParams.append('isActive', String(params.isActive));
      if (params?.isDeleted !== undefined) searchParams.append('isDeleted', String(params.isDeleted));
      
      const query = searchParams.toString();
      const endpoint = `${API_ENDPOINTS.USERS}/export${query ? `?${query}` : ''}`;
      
      return await api.get<User[]>(endpoint, {
        signal: config?.signal ?? controller.signal,
      });
    } finally {
      clear();
    }
  },

  /**
   * Get user by ID with roles info
   */
  async getUserById(id: string): Promise<User> {
    return await api.get<User>(`${API_ENDPOINTS.USERS}/${id}`);
  },

  /**
   * Create new user
   */
  async create(data: UserCreateInput): Promise<User> {
    return await api.post<User>(API_ENDPOINTS.USERS, data);
  },

  /**
   * Get current user profile
   */
  async getMe(): Promise<User> {
    return await api.get<User>(`${API_ENDPOINTS.USERS}/me`);
  },

  /**
   * Update user profile
   */
  async updateUser(id: string, data: UserUpdateInput): Promise<User> {
    return await api.put<User>(`${API_ENDPOINTS.USERS}/${id}`, data);
  },

  /**
   * Update current user's profile
   */
  async updateMe(data: UserUpdateInput): Promise<User> {
    return await api.put<User>(`${API_ENDPOINTS.USERS}/me`, data);
  },

  /**
   * Restore user
   */
  async restoreUser(id: string): Promise<void> {
    await api.post(`${API_ENDPOINTS.USERS}/${id}/restore`);
  },

  /**
   * Delete user
   */
  async deleteUser(id: string): Promise<void> {
    return api.delete(`${API_ENDPOINTS.USERS}/${id}`);
  },

  /**
   * Batch delete users
   */
  async deleteMany(ids: string[]): Promise<void> {
    await api.post(`${API_ENDPOINTS.USERS}/batch-delete`, { ids });
  },

  /**
   * Batch update status
   */
  async batchUpdateStatus(ids: string[], isActive: boolean): Promise<void> {
    await api.post(`${API_ENDPOINTS.USERS}/batch-status`, { ids, isActive });
  },

  /**
   * Batch restore users
   */
  async restoreMany(ids: string[]): Promise<void> {
    await api.post(`${API_ENDPOINTS.USERS}/batch-restore`, { ids });
  },

  /**
   * Assign roles to user (replaces all existing roles)
   */
  async assignRoles(userId: string, roleIds: string[]): Promise<User> {
    return await api.put<User>(
      `${API_ENDPOINTS.USERS}/${userId}/roles`,
      { roleIds } as UserRoleAssignment
    );
  },

  /**
   * Add a single role to user (keeps existing roles)
   */
  async addRole(userId: string, roleId: string): Promise<User> {
    return await api.post<User>(`${API_ENDPOINTS.USERS}/${userId}/roles/${roleId}`);
  },

  /**
   * Remove a specific role from user
   */
  async removeRole(userId: string, roleId: string): Promise<User> {
    return await api.delete<User>(`${API_ENDPOINTS.USERS}/${userId}/roles/${roleId}`);
  },

  /**
   * Remove all roles from user
   */
  async removeAllRoles(userId: string): Promise<User> {
    return await api.delete<User>(`${API_ENDPOINTS.USERS}/${userId}/roles`);
  },
};
