/**
 * Settings Service
 * Frontend service for interacting with the settings API
 */
import { api } from '@/config';

export interface SettingItem {
  key: string;
  value: unknown;
  visibility?: 'public' | 'admin' | 'secret';
}

export const settingsService = {
  /**
   * Get all settings (admin only - returns public + admin visibility)
   */
  async getAll(): Promise<SettingItem[]> {
    return api.get<SettingItem[]>('/settings');
  },

  /**
   * Get public settings only (for authenticated non-admin users)
   */
  async getPublic(): Promise<SettingItem[]> {
    return api.get<SettingItem[]>('/settings/public');
  },

  /**
   * Get setting by key
   */
  async getByKey<T = unknown>(key: string): Promise<T | null> {
    try {
      const response = await api.get<{ key: string; value: T }>(`/settings/${key}`);
      return response.value;
    } catch {
      return null;
    }
  },

  /**
   * Update setting
   */
  async update(key: string, value: unknown): Promise<void> {
    await api.post('/settings', { key, value });
  },

  async pruneLogs(days: number): Promise<void> {
    await api.post('/system/logs/prune', { days });
  },

  async clearCache(): Promise<void> {
    await api.post('/system/cache/clear');
  },
};
