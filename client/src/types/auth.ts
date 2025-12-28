import { AuthModel } from 'pocketbase';

/**
 * Auth types
 */
export type AuthUser = AuthModel & {
  permissions?: Record<string, string[]>;
};

export interface AuthResponse {
  user: AuthUser | null;
  isAuthenticated: boolean;
}
