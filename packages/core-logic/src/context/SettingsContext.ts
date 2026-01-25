import { createContext, useContext } from 'react';
import type { SettingItem } from '@superapp/shared-types';

export interface SettingsContextType {
  settings: SettingItem[];
  loading: boolean;
  submitting: boolean;
  fetchSettings: () => Promise<void>;
  updateSetting: (key: string, value: unknown, visibility?: 'public' | 'admin' | 'secret') => Promise<boolean>;
  getSettingValue: <T = unknown>(key: string, defaultValue: T) => T;
}

export const SettingsContext = createContext<SettingsContextType | null>(null);

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
