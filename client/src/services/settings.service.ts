/**
 * Settings Service
 * Frontend service for interacting with the settings API
 */
import { api } from '@/config';

export interface SettingItem {
  key: string;
  value: unknown;
}

export const settingsService = {
  /**
   * Get all settings
   */
  async getAll(): Promise<SettingItem[]> {
    return api.get<SettingItem[]>('/settings');
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
};
