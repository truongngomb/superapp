import { useCallback, useMemo, type ReactNode } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { SettingItem } from '@superapp/shared-types';
import { queryKeys } from '@/config/queryClient';
import { useAuth } from '@/hooks';
import { SettingsContext } from './SettingsContext.base';
import { settingsService } from '@/services';
import { getStorageItem, setStorageItem } from '@/utils';
import { STORAGE_KEYS } from '@/config';
import { useToast } from '@superapp/core-logic';

export function SettingsProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const { show } = useToast();
  const { checkPermission } = useAuth();

  // Check if user has admin access to settings
  const isAdmin = useMemo(() => {
    return checkPermission('settings', 'read');
  }, [checkPermission]);

  // Determine query key based on permissions
  const queryKey = useMemo(() => 
    isAdmin ? queryKeys.settings.all : queryKeys.settings.public(), 
  [isAdmin]);

  // Query for fetching settings
  const { 
    data: settings, 
    isLoading, 
    refetch 
  } = useQuery({
    queryKey,
    queryFn: async () => {
      const data = isAdmin 
        ? await settingsService.getAll()
        : await settingsService.getPublic();
      
      // Persist to local storage
      setStorageItem(STORAGE_KEYS.SETTINGS, data);
      return data;
    },
    // Use local storage as initial data to prevent layout flash
    initialData: () => getStorageItem<SettingItem[]>(STORAGE_KEYS.SETTINGS) || [],
    // Consider data fresh for 5 minutes
    staleTime: 5 * 60 * 1000, 
  });

  // Mutation for updating settings
  const updateMutation = useMutation({
    mutationFn: async ({ key, value, visibility }: { key: string; value: unknown; visibility?: 'public' | 'admin' | 'secret' }) => {
      await settingsService.update(key, value, visibility);
    },
    onSuccess: () => {
      // Invalidate all settings queries to ensure freshness
      void queryClient.invalidateQueries({ queryKey: queryKeys.settings.all });
      show('Setting updated successfully', 'success');
    },
    onError: () => {
      show('Failed to update setting', 'error');
    },
  });

  const updateSetting = useCallback(async (key: string, value: unknown, visibility?: 'public' | 'admin' | 'secret') => {
    try {
      await updateMutation.mutateAsync({ key, value, visibility });
      return true;
    } catch {
      return false;
    }
  }, [updateMutation]);

  const getSettingValue = useCallback(<T = unknown>(key: string, defaultValue: T): T => {
    const setting = settings.find(s => s.key === key);
    return setting ? (setting.value as T) : defaultValue;
  }, [settings]);
  
  // Expose fetchSettings manually if needed (aliased to refetch)
  const fetchSettings = useCallback(async () => {
    await refetch();
  }, [refetch]);

  const contextValue = useMemo(() => ({
    settings,
    loading: isLoading, // Initial loading state
    submitting: updateMutation.isPending,
    fetchSettings,
    updateSetting,
    getSettingValue
  }), [settings, isLoading, updateMutation.isPending, fetchSettings, updateSetting, getSettingValue]);

  return (
    <SettingsContext.Provider value={contextValue}>
      {children}
    </SettingsContext.Provider>
  );
}

