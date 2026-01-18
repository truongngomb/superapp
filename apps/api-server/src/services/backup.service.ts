/**
 * Backup Service
 * Handles interaction with PocketBase backup APIs
 */
import { adminPb } from '../config/index.js';
import { createLogger } from '../utils/index.js';
import { ServiceUnavailableError, NotFoundError } from '../middleware/index.js';

import { BackupInfo } from '@superapp/shared-types';

export class BackupService {
  private log = createLogger('BackupService');

  /**
   * List all backups
   */
  async list(): Promise<BackupInfo[]> {
    try {
      const backups = await adminPb.backups.getFullList();
      return backups.map(b => ({
        name: b.key,
        size: b.size,
        modified: b.modified,
      }));
    } catch (error) {
      this.log.error('Failed to list backups', error as Error);
      throw new ServiceUnavailableError('Failed to retrieve backups from database');
    }
  }

  /**
   * Create a new backup
   * @param name Optional custom name prefix
   */
  async create(name?: string): Promise<void> {
    try {
      // Create backup
      await adminPb.backups.create(name ?? '');
      this.log.info('Backup created successfully');
    } catch (error) {
      this.log.error('Failed to create backup', error as Error);
      throw new ServiceUnavailableError('Failed to create backup');
    }
  }

  /**
   * Restore a backup
   * @param key Backup filename
   */
  async restore(key: string): Promise<void> {
    try {
      await adminPb.backups.restore(key);
      this.log.info(`Restored backup: ${key}`);
    } catch (error) {
       this.log.error(`Failed to restore backup: ${key}`, error as Error);
       throw new ServiceUnavailableError(`Failed to restore backup: ${key}`);
    }
  }

  /**
   * Delete a backup
   * @param key Backup filename
   */
  async delete(key: string): Promise<void> {
    try {
      await adminPb.backups.delete(key);
      this.log.info(`Deleted backup: ${key}`);
    } catch (error) {
      this.log.error(`Failed to delete backup: ${key}`, error as Error);
      throw new NotFoundError(`Backup not found or could not be deleted`);
    }
  }

  /**
   * Get download URL for a backup
   * Note: This usually requires an admin token. 
   * We might need to proxy the download or generate a temporary token if PB supports it.
   * For now, we will construct the standard PB backup download URL.
   */
  getDownloadUrl(key: string): string {
    // Expected URL format: /api/backups/:key?token=...
    // Since we are inside the backend, we can allow the frontend to request it via the SDK directly if they have admin access,
    // OR we can proxy the stream.
    // However, simplest is to return the key and let frontend construct the URL using its SDK client if authenticated as admin.
    // If we want to return a direct URL:
    return adminPb.buildUrl(`/api/backups/${key}`);
  }
}

export const backupService = new BackupService();
