/**
 * Authentication Types
 */

// ============================================================================
// User Types
// ============================================================================

/**
 * Permission map: resource -> actions[]
 */
export type PermissionMap = Record<string, string[]>;

/**
 * Authenticated user data
 */
export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  verified?: boolean;
  roles?: string[];
  permissions?: PermissionMap;
  created?: string;
  updated?: string;
  /** Whether this is a guest user (with Public role permissions) */
  isGuest?: boolean;
  /** User-specific UI preferences */
  preferences?: Record<string, unknown>;
}

// ============================================================================
// Auth Response Types
// ============================================================================

/**
 * Auth status check response
 */
export interface AuthStatusResponse {
  user: AuthUser | null;
  isAuthenticated: boolean;
}

/**
 * Login response
 */
export interface LoginResponse {
  user: AuthUser;
  token?: string;
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

// ============================================================================
// OAuth Types
// ============================================================================

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
