/**
 * Authentication Context
 * Manages authentication state and user session
 */

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react';
import { authService } from '@/services';
import { logger } from '@/utils';
import { ApiException } from '@/config';
import { PermissionAction, PermissionResource } from '@/types';
import type { AuthUser } from '@/types';

// ============================================================================
// Types
// ============================================================================

interface AuthContextType {
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

// ============================================================================
// Context
// ============================================================================

const AuthContext = createContext<AuthContextType | null>(null);

/**
 * Hook to access auth context
 * @throws Error if used outside AuthProvider
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// ============================================================================
// Provider
// ============================================================================

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check auth status
  const checkAuth = useCallback(async () => {
    try {
      setError(null);
      const response = await authService.getCurrentUser();
      
      setUser(response.isAuthenticated ? response.user : null);
    } catch (err) {
      logger.error('AuthContext', 'Failed to check auth:', err);
      
      // Ignore 401/403 as it just means not logged in
      if (err instanceof ApiException) {
        if (!err.isUnauthorized && !err.isForbidden) {
          setError(err.message || 'Unknown authentication error');
        }
      }
      
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Check auth on mount
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Login with Google OAuth
  const loginWithGoogle = useCallback(() => {
    authService.loginWithGoogle();
  }, []);

  // Logout
  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch (err) {
      logger.error('AuthContext', 'Logout failed:', err);
    } finally {
      setUser(null);
    }
  }, []);

  // Refresh user data
  const refreshUser = useCallback(async () => {
    await checkAuth();
  }, [checkAuth]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Check permission
  const checkPermission = useCallback(
    (resource: string, action: string): boolean => {
      if (!user?.permissions) return false;

      const resourcePerms = user.permissions[resource] || [];
      const allPerms = user.permissions[PermissionResource.All] || [];

      return (
        resourcePerms.includes(action) ||
        resourcePerms.includes(PermissionAction.Manage) ||
        allPerms.includes(PermissionAction.Manage)
      );
    },
    [user]
  );

  // Memoize context value
  const value = useMemo<AuthContextType>(
    () => ({
      user,
      isAuthenticated: !!user,
      isLoading,
      error,
      loginWithGoogle,
      logout,
      checkPermission,
      refreshUser,
      clearError,
    }),
    [user, isLoading, error, loginWithGoogle, logout, checkPermission, refreshUser, clearError]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
      
      {/* Error Toast */}
      {error && (
        <div className="fixed bottom-4 right-4 z-50 animate-slide-up">
          <div className="bg-red-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3">
            <span className="text-lg">⚠️</span>
            <span className="flex-1">{error}</span>
            <button
              onClick={clearError}
              className="p-1 hover:bg-red-600 rounded transition-colors"
              aria-label="Dismiss"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </AuthContext.Provider>
  );
}
