/**
 * Settings Service
 * Handles system-wide configurations
 */
import { adminPb, ensureAdminAuth } from '../config/index.js';
import { CollectionNames } from '../database/collections/index.js';
import { createLogger } from '../utils/index.js';

const log = createLogger('SettingsService');

/**
 * Setting visibility levels
 */
export const SettingVisibility = {
  PUBLIC: 'public',
  ADMIN: 'admin',
  SECRET: 'secret',
} as const;

export type SettingVisibilityType = typeof SettingVisibility[keyof typeof SettingVisibility];

export interface SettingItem {
  key: string;
  value: unknown;
  visibility: SettingVisibilityType;
}

/**
 * Settings Service
 */
export const SettingsService = {
  /**
   * Get a setting by key
   * Note: Does NOT return secret settings via this method
   */
  async getSetting<T = unknown>(key: string): Promise<T | null> {
    try {
      await ensureAdminAuth();
      const record = await adminPb.collection(CollectionNames.SETTINGS).getFirstListItem(`key="${key}"`);
      
      // Never expose secret settings through API
      if (record.visibility === SettingVisibility.SECRET) {
        log.debug(`Attempted to access secret setting: ${key}`);
        return null;
      }
      
      return record.value as T;
    } catch {
      log.debug(`Setting not found: ${key}`);
      return null;
    }
  },

  /**
   * Get a setting by key (internal use only - includes secrets)
   * WARNING: Only use this for server-side operations, never expose to API
   */
  async getSettingInternal<T = unknown>(key: string): Promise<T | null> {
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
  async setSetting(key: string, value: unknown, visibility: SettingVisibilityType = SettingVisibility.ADMIN): Promise<void> {
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
        await adminPb.collection(CollectionNames.SETTINGS).update(record.id, { key, value, visibility });
        log.info(`Updated setting: ${key}`);
      } else {
        await adminPb.collection(CollectionNames.SETTINGS).create({ key, value, visibility });
        log.info(`Created setting: ${key}`);
      }
    } catch (error) {
      log.error(`Failed to set setting ${key}:`, error);
      throw error;
    }
  },

  /**
   * Get all settings (for admin users)
   * Returns public and admin settings, never secrets
   */
  async getAllSettings(): Promise<SettingItem[]> {
    try {
      await ensureAdminAuth();
      const records = await adminPb.collection(CollectionNames.SETTINGS).getFullList();
      
      // Filter out secret settings - they should never be exposed via API
      return records
        .filter(r => r.visibility !== SettingVisibility.SECRET)
        .map(r => ({
          key: r.key as string,
          value: r.value as unknown,
          visibility: r.visibility as SettingVisibilityType,
        }));
    } catch (error) {
      log.error('Failed to get all settings:', error);
      throw error;
    }
  },

  /**
   * Get public settings only (for authenticated non-admin users)
   */
  async getPublicSettings(): Promise<SettingItem[]> {
    try {
      await ensureAdminAuth();
      const records = await adminPb.collection(CollectionNames.SETTINGS).getFullList({
        filter: `visibility="${SettingVisibility.PUBLIC}"`,
      });
      
      return records.map(r => ({
        key: r.key as string,
        value: r.value as unknown,
        visibility: SettingVisibility.PUBLIC,
      }));
    } catch (error) {
      log.error('Failed to get public settings:', error);
      throw error;
    }
  },
};

