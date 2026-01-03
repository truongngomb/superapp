/**
 * User Service
 * Handles user management API calls
 */

import { api, createAbortController, API_ENDPOINTS, type RequestConfig } from '@/config';

import type { User, UserUpdateInput, UserRoleAssignment, PaginatedUsers, UserListParams } from '@/types';


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

export const userService = {
  /**
   * Get paginated list of users
   */
  async getUsers(params?: UserListParams, config?: ServiceConfig): Promise<PaginatedUsers> {
    const { controller, clear } = createAbortController(config?.timeout ?? 10000);
    
    try {
      const searchParams = new URLSearchParams();
      
      if (params?.page) searchParams.append('page', String(params.page));
      if (params?.limit) searchParams.append('limit', String(params.limit));
      if (params?.sort) searchParams.append('sort', params.sort);
      if (params?.order) searchParams.append('order', params.order);
      if (params?.search) searchParams.append('search', params.search);
      
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
   * Get user by ID with roles info
   */
  async getUserById(id: string): Promise<User> {
    return api.get<User>(`${API_ENDPOINTS.USERS}/${id}`);
  },

  /**
   * Get current user profile
   */
  async getMe(): Promise<User> {
    return api.get<User>(`${API_ENDPOINTS.USERS}/me`);
  },

  /**
   * Update user profile
   */
  async updateUser(id: string, data: UserUpdateInput): Promise<User> {
    return api.put<User>(`${API_ENDPOINTS.USERS}/${id}`, data);
  },

  /**
   * Update current user's profile
   */
  async updateMe(data: UserUpdateInput): Promise<User> {
    return api.put<User>(`${API_ENDPOINTS.USERS}/me`, data);
  },

  /**
   * Delete user
   */
  async deleteUser(id: string): Promise<void> {
    return api.delete(`${API_ENDPOINTS.USERS}/${id}`);
  },

  /**
   * Assign roles to user (replaces all existing roles)
   */
  async assignRoles(userId: string, roleIds: string[]): Promise<User> {
    return api.put<User>(
      `${API_ENDPOINTS.USERS}/${userId}/roles`,
      { roleIds } as UserRoleAssignment
    );
  },

  /**
   * Add a single role to user (keeps existing roles)
   */
  async addRole(userId: string, roleId: string): Promise<User> {
    return api.post<User>(`${API_ENDPOINTS.USERS}/${userId}/roles/${roleId}`);
  },

  /**
   * Remove a specific role from user
   */
  async removeRole(userId: string, roleId: string): Promise<User> {
    return api.delete<User>(`${API_ENDPOINTS.USERS}/${userId}/roles/${roleId}`);
  },

  /**
   * Remove all roles from user
   */
  async removeAllRoles(userId: string): Promise<User> {
    return api.delete<User>(`${API_ENDPOINTS.USERS}/${userId}/roles`);
  },
};
