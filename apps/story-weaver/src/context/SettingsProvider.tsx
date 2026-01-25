import { useState, useCallback, useEffect, useMemo, ReactNode } from 'react';
import { SettingsContext } from './SettingsContext.base';
import type { SettingsContextType } from './SettingsContext.types';
import { settingsService, SettingItem } from '@/services';
import { logger } from '@/utils';
import { useAuth } from '@superapp/core-logic';

interface SettingsProviderProps {
  children: ReactNode;
}

export function SettingsProvider({ children }: SettingsProviderProps) {
  const [settings, setSettings] = useState<SettingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { isAuthenticated } = useAuth();

  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      // For now just try getPublic as safe default, 
      const data = await settingsService.getPublic(); 
      setSettings(data);
    } catch (error) {
      logger.error('SettingsProvider', 'Failed to fetch settings', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch on mount and when auth changes
  useEffect(() => {
    void fetchSettings();
  }, [fetchSettings, isAuthenticated]);

  const updateSetting = useCallback(async (
    key: string, 
    value: unknown, 
    visibility?: 'public' | 'admin' | 'secret'
  ) => {
    try {
      setSubmitting(true);
      await settingsService.update(key, value, visibility);
      
      // Update local state optimistic
      setSettings(prev => {
        const index = prev.findIndex(s => s.key === key);
        if (index >= 0) {
          const newSettings = [...prev];
          newSettings[index] = { ...newSettings[index], value };
          return newSettings;
        }
        return prev;
      });
      
      void fetchSettings();
      return true;
    } catch (error) {
      logger.error('SettingsProvider', 'Failed to update setting', error);
      return false;
    } finally {
      setSubmitting(false);
    }
  }, [fetchSettings]);

  const getSettingValue = useCallback(<T = unknown>(key: string, defaultValue: T): T => {
    const setting = settings.find(s => s.key === key);
    if (!setting) return defaultValue;
    return setting.value as T;
  }, [settings]);

  const value = useMemo<SettingsContextType>(() => ({
    settings,
    loading,
    submitting,
    fetchSettings,
    updateSetting,
    getSettingValue,
  }), [settings, loading, submitting, fetchSettings, updateSetting, getSettingValue]);

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}
