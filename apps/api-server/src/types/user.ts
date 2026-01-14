/**
 * User & Authentication Types
 */

// Re-export main entities from shared-types
export type { 
  User, 
  AuthUser,
  AuthStatusResponse as UserSession,
  LoginResponse as AuthResult,
} from '@superapp/shared-types';

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
