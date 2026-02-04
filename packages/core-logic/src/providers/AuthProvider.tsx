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
import { useTranslation } from 'react-i18next';
import { PermissionAction, PermissionResource } from '@superapp/shared-types';
import type { AuthUser } from '@superapp/shared-types';
import { AuthContext, type AuthContextType } from '../context/AuthContext';
import { authService } from '../services/auth.service';
import { logger } from '../utils/logger';
import { setStorageItem, removeStorageItem } from '../utils/storage';
import { ApiException } from '../config/api';
import { STORAGE_KEYS } from '../config/constants';

// ============================================================================
// Provider
// ============================================================================

export interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { t, i18n } = useTranslation(['uikit']);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Sync preferences (continuous) using generic hook
  // We adapt the usage here. The generic hook handles the syncing if we pass callbacks, but 
  // currently usePreferenceSync in core-logic is generic.
  // Wait, I updated usePreferenceSync to be generic in Step 105.
  // But web-core had a specific implementation.
  // The specific implementation used userService.update.
  // core-logic doesn't have userService yet.
  
  // Strategy: For now, we omit usePreferenceSync inside AuthProvider if we can't fully support it yet without UserService.
  // OR we keep it simplified. 
  // Let's defer "Continuous Sync" feature inside AuthProvider until we have UserService moved.
  // But we DO need to load preferences on login.

  // Check auth status
  const checkAuth = useCallback(async () => {
    try {
      setError(null);
      const response = await authService.getCurrentUser();
      
      // Set user even for guest (with permissions from Public role)
      // Guest users have user object with isGuest=true
      if (response.user) {
        setUser(response.user);
        
        // Sync preferences from DB to LocalStorage
        if (response.user.preferences) {
          const validKeys = Object.values(STORAGE_KEYS) as string[];
          
          for (const [key, value] of Object.entries(response.user.preferences)) {
            if (key === 'language' && i18n.language !== value) {
              void i18n.changeLanguage(value as string);
            } else if (validKeys.includes(key)) {
              setStorageItem(key, value as string | number | boolean | Record<string, unknown> | null);
            }
          }
        }
      } else {
        setUser(null);
      }
    } catch (err) {
      logger.error('AuthContext', 'Failed to check auth:', err);
      
      // Ignore 401/403 as it just means not logged in
      if (err instanceof ApiException) {
        if (!err.isUnauthorized && !err.isForbidden) {
          setError(err.message || t('toast.unknown_auth'));
        }
      }
      
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, [t, i18n]);

  // Check auth on mount
  useEffect(() => {
    void checkAuth();
  }, [checkAuth]);

  // Login with Google OAuth
  const loginWithGoogle = useCallback((redirectTo?: string) => {
    authService.loginWithGoogle(redirectTo);
  }, []);

  // Logout
  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch (err) {
      logger.error('AuthContext', 'Logout failed:', err);
    } finally {
      // Clear user-specific localStorage (but keep public settings like layout_config)
      // Remove user preferences
      removeStorageItem(STORAGE_KEYS.USER_PREFERENCES);
      removeStorageItem(STORAGE_KEYS.AUTH_TOKEN);
      
      // Remove view mode preferences (user-specific)
      // We iterate keys to clear
      const keysToClear = [
        STORAGE_KEYS.CATEGORIES_VIEW_MODE,
        STORAGE_KEYS.CATEGORIES_SORT,
        STORAGE_KEYS.USERS_VIEW_MODE,
        STORAGE_KEYS.USERS_SORT,
        STORAGE_KEYS.ROLES_VIEW_MODE,
        STORAGE_KEYS.ROLES_SORT,
        STORAGE_KEYS.ACTIVITY_LOGS_SORT,
        STORAGE_KEYS.MARKDOWN_PAGES_VIEW_MODE,
        STORAGE_KEYS.MARKDOWN_PAGES_SORT,
        STORAGE_KEYS.API_DOCS_VIEW_MODE,
      ];
      keysToClear.forEach(key => {
        removeStorageItem(key);
      });
      
      // Keep SETTINGS (contains public layout_config)
      // Keep THEME (user preference but harmless)
      
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
  const checkPermission = useCallback(
    (resource: string, action: string): boolean => {
      // Guest users can have permissions from Public role
      const permissions = user?.permissions;
      if (!permissions) return false;

      const resourcePerms = (permissions[resource] as string[] | undefined) || [];
      const allPerms = (permissions[PermissionResource.All] as string[] | undefined) || [];

      return (
        resourcePerms.includes(action) ||
        resourcePerms.includes(PermissionAction.Manage) ||
        allPerms.includes(PermissionAction.Manage)
      );
    },
    [user]
  );

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
      
      {/* Error Toast - Simple Implementation directly here to avoid circular dep with ToastProvider if generic */}
      {error && (
        <div className="fixed bottom-4 right-4 z-50 animate-slide-up">
          <div className="bg-red-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3">
            <span className="text-lg">⚠️</span>
            <span className="flex-1">{error}</span>
            <button
              onClick={clearError}
              className="p-1 hover:bg-red-600 rounded transition-colors"
              aria-label={t('close')}
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </AuthContext.Provider>
  );
}
