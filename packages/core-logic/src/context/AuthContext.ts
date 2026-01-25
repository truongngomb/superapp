import { createContext, useContext } from 'react';
import type { AuthUser } from '@superapp/shared-types';

export interface AuthContextType {
  /** Current authenticated user */
  user: AuthUser | null;
  /** Whether user is authenticated */
  isAuthenticated: boolean;
  /** Whether auth check is in progress */
  isLoading: boolean;
  /** Auth error message */
  error: string | null;
  /** Initiate Google OAuth login */
  loginWithGoogle: () => void;
  /** Logout current user */
  logout: () => Promise<void>;
  /** Check if user has specific permission */
  checkPermission: (resource: string, action: string) => boolean;
  /** Refresh user session */
  refreshUser: () => Promise<void>;
  /** Clear auth error */
  clearError: () => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
