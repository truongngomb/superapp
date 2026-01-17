/**
 * User & Authentication Types
 * 
 * Re-exports all user-related types from shared-types package.
 * This ensures type consistency between Frontend and Backend.
 */

// Re-export all user types from shared-types
export type { 
  User, 
  AuthUser,
  UserCreateInput,
  UserUpdateInput,
  UserRoleAssignment,
  AuthStatusResponse as UserSession,
  LoginResponse as AuthResult,
} from '@superapp/shared-types';

