import type { SettingItem } from '@/services';

export interface SettingsContextType {
  settings: SettingItem[];
  loading: boolean;
  submitting: boolean;
  fetchSettings: () => Promise<void>;
  updateSetting: (key: string, value: unknown, visibility?: 'public' | 'admin' | 'secret') => Promise<boolean>;
  getSettingValue: <T = unknown>(key: string, defaultValue: T) => T;
}
