import { useState, useEffect, useCallback, type ReactNode } from 'react';
import { settingsService, type SettingItem } from '@/services';
import { useToast } from '@/context';
import { SettingsContext } from './SettingsContext.base';

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<SettingItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { show } = useToast();

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    try {
      const data = await settingsService.getAll();
      setSettings(data);
    } catch {
      show('Failed to fetch settings', 'error');
    } finally {
      setLoading(false);
    }
  }, [show]);

  const updateSetting = async (key: string, value: unknown) => {
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
  };

  const getSettingValue = useCallback(<T = unknown>(key: string, defaultValue: T): T => {
    const setting = settings.find(s => s.key === key);
    return setting ? (setting.value as T) : defaultValue;
  }, [settings]);

  useEffect(() => {
    void fetchSettings();
  }, [fetchSettings]);

  return (
    <SettingsContext.Provider value={{
      settings,
      loading,
      submitting,
      fetchSettings,
      updateSetting,
      getSettingValue
    }}>
      {children}
    </SettingsContext.Provider>
  );
}
