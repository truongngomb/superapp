import { api } from '@/config/api';
import type { SystemStats, RequestMetrics, SystemMetricSnapshot } from '@superapp/shared-types';

export const systemService = {
  getStats: async (): Promise<SystemStats> => {
    return api.get<SystemStats>('/system/stats');
  },
  
  getRequestMetrics: async (): Promise<RequestMetrics> => {
    return api.get<RequestMetrics>('/system/requests');
  },

  getHistory: async (limit = 50): Promise<SystemMetricSnapshot[]> => {
    return api.get<SystemMetricSnapshot[]>(`/system/history?limit=${String(limit)}`);
  },
};
