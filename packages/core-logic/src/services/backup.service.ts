import { api } from '../config/api';
import { env } from '../config/env';
import type { BackupItem } from '@superapp/shared-types';

export const backupService = {
  /**
   * List all backups
   */
  list: async (): Promise<BackupItem[]> => {
    const response = await api.get<BackupItem[]>('/system/backups');
    return response;
  },

  /**
   * Create a new backup
   */
  create: async (name?: string): Promise<void> => {
    await api.post('/system/backups', { name });
  },

  /**
   * Restore a backup
   */
  restore: async (key: string): Promise<void> => {
    await api.post(`/system/backups/${encodeURIComponent(key)}/restore`);
  },

  /**
   * Delete a backup
   */
  delete: async (key: string): Promise<void> => {
    await api.delete(`/system/backups/${encodeURIComponent(key)}`);
  },

  /**
   * Get download URL (Admin only)
   */
  getDownloadUrl: (key: string): string => {
    const baseUrl = (env.POCKETBASE_URL || '').replace(/\/$/, '');
    return `${baseUrl}/api/backups/${encodeURIComponent(key)}`;
  }
};
