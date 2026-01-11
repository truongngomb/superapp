/**
 * Settings Service
 * Handles system-wide configurations
 */
import { adminPb, ensureAdminAuth } from '../config/index.js';
import { CollectionNames } from '../database/collections/index.js';
import { createLogger } from '../utils/index.js';

const log = createLogger('SettingsService');

export interface SettingItem {
  key: string;
  value: unknown;
}

/**
 * Settings Service
 */
export const SettingsService = {
  /**
   * Get a setting by key
   */
  async getSetting<T = unknown>(key: string): Promise<T | null> {
    try {
      await ensureAdminAuth();
      const record = await adminPb.collection(CollectionNames.SETTINGS).getFirstListItem(`key="${key}"`);
      return record.value as T;
    } catch {
      log.debug(`Setting not found: ${key}`);
      return null;
    }
  },

  /**
   * Update or create a setting
   */
  async setSetting(key: string, value: unknown): Promise<void> {
    try {
      await ensureAdminAuth();
      // Try to find existing
      let record;
      try {
        record = await adminPb.collection(CollectionNames.SETTINGS).getFirstListItem(`key="${key}"`);
      } catch {
        // Not found, will create
      }

      if (record) {
        await adminPb.collection(CollectionNames.SETTINGS).update(record.id, { key, value });
        log.info(`Updated setting: ${key}`);
      } else {
        await adminPb.collection(CollectionNames.SETTINGS).create({ key, value });
        log.info(`Created setting: ${key}`);
      }
    } catch (error) {
      log.error(`Failed to set setting ${key}:`, error);
      throw error;
    }
  },

  /**
   * Get all settings
   */
  async getAllSettings(): Promise<SettingItem[]> {
    try {
      await ensureAdminAuth();
      const records = await adminPb.collection(CollectionNames.SETTINGS).getFullList();
      return records.map(r => ({ key: r.key as string, value: r.value as unknown }));
    } catch (error) {
      log.error('Failed to get all settings:', error);
      throw error;
    }
  }
};
