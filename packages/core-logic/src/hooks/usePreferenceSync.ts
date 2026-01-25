import { useEffect, useRef, useCallback } from 'react';
import { useDebounceCallback } from './useDebounceCallback';
import { getStorageItem } from '../utils';

export interface UsePreferenceSyncOptions {
  userId?: string;
  isAuthenticated: boolean;
  syncKeys: readonly string[];
  onSync: (prefs: Record<string, unknown>) => Promise<void>;
  onError?: (err: unknown) => void;
  debounceMs?: number;
}

/**
 * Synchronizes user preferences from localStorage to the database
 * @param options - Configuration options
 */
export function usePreferenceSync({
  userId,
  isAuthenticated,
  syncKeys,
  onSync,
  onError,
  debounceMs = 2000
}: UsePreferenceSyncOptions): void {
  const lastSyncRef = useRef('');

  const getLocalPreferences = useCallback((): Record<string, unknown> => {
    const prefs: Record<string, unknown> = {};
    
    for (const key of syncKeys) {
      const val = getStorageItem(key);
      if (val !== null) prefs[key] = val;
    }
    
    // Include i18next language generic handling
    // Check if we are in a browser environment
    if (typeof localStorage !== 'undefined') {
      const lang = localStorage.getItem('i18nextLng');
      if (lang) prefs.language = lang;
    }
    
    return prefs;
  }, [syncKeys]);

  const syncToDb = useDebounceCallback(async () => {
    if (!isAuthenticated || !userId) return;

    const currentPrefs = getLocalPreferences();
    const prefsString = JSON.stringify(currentPrefs);

    // Skip if unchanged
    if (prefsString === lastSyncRef.current) return;

    try {
      await onSync(currentPrefs);
      lastSyncRef.current = prefsString;
    } catch (err) {
      if (onError) onError(err);
      else console.error('[PreferenceSync] Failed to sync:', err);
    }
  }, debounceMs);

  useEffect(() => {
    if (!isAuthenticated || !userId) return;

    // Initialize sync ref to prevent immediate re-sync after load
    lastSyncRef.current = JSON.stringify(getLocalPreferences());

    // Sync on mount
    syncToDb();

    // Listen for storage changes
    const handleStorageChange = () => {
      syncToDb();
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('local-storage-update', handleStorageChange);
      window.addEventListener('storage', handleStorageChange);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('local-storage-update', handleStorageChange);
        window.removeEventListener('storage', handleStorageChange);
      }
    };
  }, [isAuthenticated, userId, syncToDb, getLocalPreferences]);
}
