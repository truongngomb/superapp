import { useState, useEffect, useCallback, useMemo, type ReactNode } from 'react';
import { settingsService, type SettingItem } from '@/services';
import { useToast } from '@/context';
import { useAuth } from '@/hooks';
import { SettingsContext } from './SettingsContext.base';

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<SettingItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { show } = useToast();
  const { checkPermission } = useAuth();

  // Check if user has admin access to settings
  const isAdmin = useMemo(() => {
    return checkPermission('settings', 'read');
  }, [checkPermission]);

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    try {
      // Use getAll for admin, getPublic for regular users and guests
      const data = isAdmin 
        ? await settingsService.getAll()
        : await settingsService.getPublic();
      setSettings(data);
    } catch {
      show('Failed to fetch settings', 'error');
    } finally {
      setLoading(false);
    }
  }, [show, isAdmin]);

  const updateSetting = useCallback(async (key: string, value: unknown) => {
    setSubmitting(true);
    try {
      await settingsService.update(key, value);
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

