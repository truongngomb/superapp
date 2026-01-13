import { BaseEntity, PaginatedResponse } from './common';

/**
 * User entity from API
 */
export interface User extends BaseEntity {
  email: string;
  name: string;
  avatar?: string;
  roles?: string[];
  roleNames?: string[];
  preferences?: Record<string, unknown>;
}

// ============================================================================
// Input/DTO Types
// ============================================================================

/**
 * Create user input
 */
export interface UserCreateInput {
  email: string;
  name: string;
  password?: string;
  passwordConfirm?: string;
  isActive?: boolean;
  roles?: string[];
}

/**
 * Update user input
 */
export interface UserUpdateInput {
  name?: string;
  avatar?: string;
  emailVisibility?: boolean;
  isActive?: boolean;
  roles?: string[];
  preferences?: Record<string, unknown>;
}

/**
 * User role assignment
 */
export interface UserRoleAssignment {
  roleIds: string[];
}

// ============================================================================
// Query Types
// ============================================================================

/**
 * Paginated users response
 */
export type PaginatedUsers = PaginatedResponse<User>;

/**
 * User list query parameters
 */
export interface UserListParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
  search?: string;
  isActive?: boolean;
  isDeleted?: boolean;
}
