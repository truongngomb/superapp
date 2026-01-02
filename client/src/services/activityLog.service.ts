/**
 * Activity Log Service
 * Handles fetching activity logs from the backend
 */
import { api } from '@/config';
import type { PaginatedActivityLogs, ActivityLogParams } from '@/types';

export const activityLogService = {
  /**
   * Get paginated activity logs
   */
  async getLogs(params?: ActivityLogParams): Promise<PaginatedActivityLogs> {
    const searchParams = new URLSearchParams();
    
    if (params?.page) searchParams.set('page', String(params.page));
    if (params?.limit) searchParams.set('limit', String(params.limit));
    if (params?.sort) searchParams.set('sort', params.sort);
    if (params?.order) searchParams.set('order', params.order);
    if (params?.search) searchParams.set('search', params.search);
    
    const query = searchParams.toString();
    const endpoint = query ? `/activity-logs?${query}` : '/activity-logs';
    
    return api.get<PaginatedActivityLogs>(endpoint);
  }
};

