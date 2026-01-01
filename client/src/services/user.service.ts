/**
 * User Service
 * Handles user management API calls
 */

import { api } from '@/config';
import { API_ENDPOINTS } from '@/config';

// ============================================================================
// Types
// ============================================================================

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role?: string;
  roleName?: string;
  isActive?: boolean;
  created: string;
  updated: string;
}

export interface UserUpdateInput {
  name?: string;
  avatar?: string;
  emailVisibility?: boolean;
}

export interface UserRoleAssignment {
  roleId: string;
}

export interface PaginatedUsers {
  items: User[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface UserListParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
  filter?: string;
}

// ============================================================================
// Service
// ============================================================================

export const userService = {
  /**
   * Get paginated list of users
   */
  async getUsers(params?: UserListParams): Promise<PaginatedUsers> {
    const searchParams = new URLSearchParams();
    
    if (params?.page) searchParams.set('page', String(params.page));
    if (params?.limit) searchParams.set('limit', String(params.limit));
    if (params?.sort) searchParams.set('sort', params.sort);
    if (params?.order) searchParams.set('order', params.order);
    if (params?.filter) searchParams.set('filter', params.filter);
    
    const query = searchParams.toString();
    const endpoint = query 
      ? `${API_ENDPOINTS.USERS}?${query}` 
      : API_ENDPOINTS.USERS;
    
    return api.get<PaginatedUsers>(endpoint);
  },

  /**
   * Get user by ID with role info
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
   * Assign role to user
   */
  async assignRole(userId: string, roleId: string): Promise<User> {
    return api.put<User>(
      `${API_ENDPOINTS.USERS}/${userId}/role`,
      { roleId } as UserRoleAssignment
    );
  },

  /**
   * Remove role from user
   */
  async removeRole(userId: string): Promise<User> {
    return api.delete<User>(`${API_ENDPOINTS.USERS}/${userId}/role`);
  },
};
