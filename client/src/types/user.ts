/**
 * User Types
 */

// ============================================================================
// Entity
// ============================================================================

/**
 * User entity from API
 */
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  roles?: string[];
  roleNames?: string[];
  isActive?: boolean;
  created: string;
  updated: string;
}

// ============================================================================
// Input/DTO Types
// ============================================================================

/**
 * Update user input
 */
export interface UserUpdateInput {
  name?: string;
  avatar?: string;
  emailVisibility?: boolean;
  isActive?: boolean;
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
export interface PaginatedUsers {
  items: User[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/**
 * User list query parameters
 */
export interface UserListParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
  filter?: string;
}
