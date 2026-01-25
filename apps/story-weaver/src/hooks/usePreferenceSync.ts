/**
 * usePreferenceSync Hook
 * Automatically syncs local storage preferences to the database when they change.
 */
import { useEffect, useRef, useCallback } from 'react';
import { useDebounceCallback } from '@superapp/core-logic';
import { STORAGE_KEYS } from '@/config';
import { getStorageItem } from '@/utils';
import { userService } from '@/services';
import type { AuthUser } from '@superapp/shared-types';

// Keys to sync from localStorage to database
const SYNC_KEYS = [
  STORAGE_KEYS.THEME,
  STORAGE_KEYS.CATEGORIES_VIEW_MODE,
  STORAGE_KEYS.USERS_VIEW_MODE,
  STORAGE_KEYS.ROLES_VIEW_MODE,
  STORAGE_KEYS.CATEGORIES_SORT,
  STORAGE_KEYS.USERS_SORT,
  STORAGE_KEYS.ROLES_SORT,
  STORAGE_KEYS.ACTIVITY_LOGS_SORT,
  STORAGE_KEYS.DESKTOP_SIDEBAR_OPEN,
] as const;

/**
 * Synchronizes user preferences from localStorage to the database
 * @param user - Current authenticated user
 * @param isAuthenticated - Whether user is authenticated (not guest)
 */
export function usePreferenceSync(user: AuthUser | null, isAuthenticated: boolean): void {
  const lastSyncRef = useRef('');

  const getLocalPreferences = useCallback((): Record<string, unknown> => {
    const prefs: Record<string, unknown> = {};
    
    for (const key of SYNC_KEYS) {
      const val = getStorageItem(key);
      if (val !== null) prefs[key] = val;
    }
    
    // Include i18next language
    const lang = localStorage.getItem('i18nextLng');
    if (lang) prefs.language = lang;
    
    return prefs;
  }, []);

  const syncToDb: () => void = useDebounceCallback(async () => {
    if (!isAuthenticated || !user?.id) return;

    const currentPrefs = getLocalPreferences();
    const prefsString = JSON.stringify(currentPrefs);

    // Skip if unchanged
    if (prefsString === lastSyncRef.current) return;

    try {
      await userService.update(user.id, { preferences: currentPrefs });
      lastSyncRef.current = prefsString;
    } catch (err) {
      console.error('[PreferenceSync] Failed to sync:', err);
    }
  }, 2000);

  useEffect(() => {
    if (!isAuthenticated || !user?.id) return;

    // Initialize sync ref to prevent immediate re-sync after load
    lastSyncRef.current = JSON.stringify(getLocalPreferences());

    // Sync on mount
    syncToDb();

    // Listen for storage changes
    const handleStorageChange = () => {
      syncToDb();
    };

    window.addEventListener('local-storage-update', handleStorageChange);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('local-storage-update', handleStorageChange);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [isAuthenticated, user?.id, syncToDb, getLocalPreferences]);
}
