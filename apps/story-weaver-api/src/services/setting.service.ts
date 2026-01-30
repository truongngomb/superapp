import { BaseService } from './base.service.js';
import type { MinimalEntity } from '../types/index.js';
import { DEFAULT_SW_SETTINGS } from '../config/default-settings.js';
import { logger } from '../utils/logger.js';

interface SettingEntity extends MinimalEntity {
  key: string;
  value: unknown;
  description?: string;
  visibility: 'public' | 'admin' | 'secret';
  group?: string;
}

class SettingService extends BaseService<SettingEntity> {
  protected readonly collectionName = 'settings';
  protected readonly cacheKey = 'sw_settings';
  protected override readonly cacheTtl = 3600; // Cache for 1 hour

  protected mapRecord(record: Record<string, unknown>): SettingEntity {
    return {
      id: record.id as string,
      key: record.key as string,
      value: record.value,
      description: record.description as string | undefined,
      visibility: record.visibility as 'public' | 'admin' | 'secret',
      group: record.group as string | undefined,
      created: record.created as string
    };
  }

  /**
   * Get a setting by key, returning default value if not found
   */
  async get<T = unknown>(key: string, storedDefault?: T): Promise<T> {
    try {
      const setting = await this.getFirstByField('key', key);
      if (setting) {
        return setting.value as T;
      }
    } catch {
      // Ignore error and fallthrough to default
    }

    if (storedDefault !== undefined) {
      return storedDefault;
    }

    // Fallback to code-level default
    const codeDefault = DEFAULT_SW_SETTINGS[key];
    if (codeDefault) {
      return codeDefault.value as T;
    }

    throw new Error(`Setting key '${key}' not found and no default provided`);
  }

  /**
   * Set a setting value (Create or Update)
   */
  async set(key: string, value: unknown, options: Partial<SettingEntity> = {}): Promise<void> {
    const existing = await this.getFirstByField('key', key);
    
    if (existing) {
      await this.update(existing.id, { value, ...options });
    } else {
      await this.create({
        key,
        value,
        visibility: options.visibility || 'admin',
        description: options.description,
        group: options.group,
      });
    }
  }

  /**
   * Initialize default settings if they don't exist
   */
  async initDefaults(): Promise<void> {
    logger.info('SettingService', 'Checking default settings...');
    
    // Ensure DB is available before proceeding
    try {
        await this.ensureDbAvailable();
    } catch {
        logger.warn('SettingService', 'Database unavailable via Admin Auth. Skipping initDefaults.');
        return;
    }

    const settings = Object.entries(DEFAULT_SW_SETTINGS);
    let createdCount = 0;

    for (const [key, config] of settings) {
      try {
        const exists = await this.getFirstByField('key', key);
        if (!exists) {
          await this.create({
            key,
            value: config.value,
            description: config.description,
            visibility: config.visibility,
            group: config.group
          });
          createdCount++;
        }
      } catch (error) {
        logger.error('SettingService', `Failed to init setting ${key}`, error);
      }
    }

    if (createdCount > 0) {
      logger.info('SettingService', `Initialized ${createdCount} new default settings.`);
    } else {
      logger.debug('SettingService', 'All default settings already exist.');
    }
  }
}

export const settingService = new SettingService();
