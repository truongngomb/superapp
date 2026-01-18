import { BaseEntity, PaginatedResponse } from './common.js';

/**
 * User entity from API
 */
export interface User extends BaseEntity {
  email: string;
  name: string;
  avatar?: string;
  /** Role IDs */
  roles?: string[];
  /** Role Names (expanded) */
  roleNames?: string[];
  emailVisibility?: boolean;
  preferences?: Record<string, unknown>;
}

/**
 * Authenticated user extension
 */
export interface AuthUser extends User {
  permissions: Record<string, string[]>;
  isGuest?: boolean;
}

/**
 * Auth Status response
 */
export interface AuthStatusResponse {
  user: AuthUser | null;
  isAuthenticated: boolean;
}

// Backend uses alias UserSession
export type UserSession = AuthStatusResponse;

/**
 * OAuth Login Response
 */
export interface LoginResponse {
  token: string;
  userId: string;
}

// Backend uses alias AuthResult
export type AuthResult = LoginResponse;


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

// ============================================================================
// Auth Request Types
// ============================================================================

/**
 * Email/Password login input
 */
export interface LoginInput {
  email: string;
  password: string;
}

/**
 * Registration input
 */
export interface RegisterInput {
  email: string;
  password: string;
  name?: string;
}

/**
 * OAuth provider names
 */
export type OAuthProvider = 'google' | 'github' | 'facebook';

/**
 * OAuth config response
 */
export interface OAuthConfigResponse {
  clientId: string;
  redirectUri: string;
}

