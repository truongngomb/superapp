import { api } from '@/config/api';
import type { SystemStats } from '@/types/system';

export const systemService = {
  getStats: async (): Promise<SystemStats> => {
    const data = await api.get<SystemStats>('/system/stats');
    return data;
  },
};
