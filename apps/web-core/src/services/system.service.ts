import { api } from '@/config/api';
import type { SystemStats } from '@superapp/shared-types';

export const systemService = {
  getStats: async (): Promise<SystemStats> => {
    const data = await api.get<SystemStats>('/system/stats');
    return data;
  },
};
