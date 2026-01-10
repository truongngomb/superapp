/**
 * User & Authentication Types
 */
import type { BaseEntity } from './common.js';
import type { RolePermissions } from './role.js';

// =============================================================================
// User Entity
// =============================================================================

/**
 * Full user entity from database
 */
export interface User extends BaseEntity {
  /** User's email address */
  email: string;
  /** User's display name */
  name: string;
  /** Avatar URL or filename */
  avatar?: string;
  /** Whether email is verified */
  emailVisibility?: boolean;
  /** Reference to user's roles (IDs) */
  roles?: string[];
  /** Expanded role names (only when expand='roles') */
  roleNames?: string[];
}

// =============================================================================
// Authentication Types
// =============================================================================

/**
 * Authenticated user in request context (middleware)
 * Minimal info needed for authorization checks
 */
export interface AuthUser {
  /** User ID */
  id: string;
  /** User email */
  email: string;
  /** User's role IDs (optional) */
  roles?: string[];
  /** Resolved permissions from role */
  permissions: RolePermissions;
}

/**
 * User session response (API response)
 * Contains display info for the client
 */
export interface UserSession {
  user: {
    id: string;
    email: string;
    name: string;
    avatar: string | null;
    permissions: RolePermissions;
  } | null;
  isAuthenticated: boolean;
}

/**
 * OAuth authentication result
 */
export interface AuthResult {
  /** JWT token */
  token: string;
  /** User record from PocketBase */
  record: User;
}

// =============================================================================
// User Input Types
// =============================================================================

/**
 * Input for creating a new user (admin only)
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
 * Input for updating a user profile
 */
export interface UserUpdateInput {
  /** User's display name */
  name?: string;
  /** Avatar URL or filename */
  avatar?: string;
  /** Whether email is visible */
  emailVisibility?: boolean;
  /** Whether user is active */
  isActive?: boolean;
}

/**
 * Input for assigning roles to a user
 */
export interface UserRoleAssignment {
  /** Role IDs to assign */
  roleIds: string[];
}

