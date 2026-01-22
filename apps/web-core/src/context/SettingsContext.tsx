import { useState, useEffect, useCallback, useMemo, type ReactNode } from 'react';
import { settingsService, type SettingItem } from '@/services';
import { useToast } from './useToast';
import { useAuth } from '@/hooks/useAuth';
import { SettingsContext } from './SettingsContext.base';
import { getStorageItem, setStorageItem } from '@/utils';
import { STORAGE_KEYS } from '@/config';

export function SettingsProvider({ children }: { children: ReactNode }) {
  // Initialize from local storage if available to prevent layout flash
  const [settings, setSettings] = useState<SettingItem[]>(() => {
    return getStorageItem<SettingItem[]>(STORAGE_KEYS.SETTINGS) || [];
  });
  
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { show } = useToast();
  const { checkPermission } = useAuth();

  // Check if user has admin access to settings
  const isAdmin = useMemo(() => {
    return checkPermission('settings', 'read');
  }, [checkPermission]);

  const fetchSettings = useCallback(async () => {
    // Only set loading if we don't have settings yet (silent refresh)
    if (settings.length === 0) {
      setLoading(true);
    }
    
    try {
      // Use getAll for admin, getPublic for regular users and guests
      const data = isAdmin 
        ? await settingsService.getAll()
        : await settingsService.getPublic();
      
      setSettings(data);
      // Persist to local storage
      setStorageItem(STORAGE_KEYS.SETTINGS, data);
    } catch {
      show('Failed to fetch settings', 'error');
    } finally {
      setLoading(false);
    }
  }, [show, isAdmin, settings.length]);

  const updateSetting = useCallback(async (key: string, value: unknown, visibility?: 'public' | 'admin' | 'secret') => {
    setSubmitting(true);
    try {
      await settingsService.update(key, value, visibility);
      await fetchSettings();
      show('Setting updated successfully', 'success');
      return true;
    } catch {
      show('Failed to update setting', 'error');
      return false;
    } finally {
      setSubmitting(false);
    }
  }, [fetchSettings, show]);

  const getSettingValue = useCallback(<T = unknown>(key: string, defaultValue: T): T => {
    const setting = settings.find(s => s.key === key);
    return setting ? (setting.value as T) : defaultValue;
  }, [settings]);

  useEffect(() => {
    void fetchSettings();
  }, [fetchSettings]);

  const contextValue = useMemo(() => ({
    settings,
    loading,
    submitting,
    fetchSettings,
    updateSetting,
    getSettingValue
  }), [settings, loading, submitting, fetchSettings, updateSetting, getSettingValue]);

  return (
    <SettingsContext.Provider value={contextValue}>
      {children}
    </SettingsContext.Provider>
  );
}

