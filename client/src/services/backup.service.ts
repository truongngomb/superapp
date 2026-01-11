import { api } from '@/config/api';

export interface BackupItem {
  key: string;
  size: number;
  modified: string;
}

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
    const pbUrl = (import.meta.env.VITE_POCKETBASE_URL as string) || window.location.origin;
    const baseUrl = pbUrl.replace(/\/$/, '');
    return `${baseUrl}/api/backups/${encodeURIComponent(key)}`;
  }
};
