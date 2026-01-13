/**
 * Auth Provider Component
 * Manages authentication state and user session
 */

import {
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
import { AuthContext, type AuthContextType } from './AuthContext';

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
      
      // Set user even for guest (with permissions from Public role)
      // Guest users have user object with isGuest=true
      if (response.user) {
        setUser(response.user);
      } else {
        setUser(null);
      }
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
    void checkAuth();
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
      // Refresh auth state to load guest permissions
      await checkAuth();
    }
  }, [checkAuth]);

  // Refresh user data
  const refreshUser = useCallback(async () => {
    await checkAuth();
  }, [checkAuth]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Check permission
  // Now works for both authenticated users and guest users with Public role permissions
  const checkPermission = useCallback(
    (resource: string, action: string): boolean => {
      // Guest users can have permissions from Public role
      const permissions = user?.permissions;
      if (!permissions) return false;

      const resourcePerms = permissions[resource] || [];
      const allPerms = permissions[PermissionResource.All] || [];

      return (
        resourcePerms.includes(action) ||
        resourcePerms.includes(PermissionAction.Manage) ||
        allPerms.includes(PermissionAction.Manage)
      );
    },
    [user]
  );

  // Memoize context value
  // isAuthenticated is false for guest users (user.isGuest = true)
  const value = useMemo<AuthContextType>(
    () => ({
      user,
      isAuthenticated: !!user && !user.isGuest,
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
