/**
 * Activity Log Service
 * Handles fetching activity logs from the backend
 */
import { api, createAbortController, API_ENDPOINTS, type RequestConfig } from '@/config';
import type { ActivityLog, PaginatedActivityLogs, ActivityLogParams } from '@/types';

// ============================================================================
// Types
// ============================================================================

interface ServiceConfig extends Omit<RequestConfig, 'signal'> {
  /** Request timeout in ms (default: 10000) */
  timeout?: number;
  /** AbortSignal for cancellation */
  signal?: AbortSignal;
}

// ============================================================================
// Service
// ============================================================================

export const activityLogService = {
  /**
   * Get paginated activity logs
   */
  async getPage(params?: ActivityLogParams, config?: ServiceConfig): Promise<PaginatedActivityLogs> {
    const { controller, clear } = createAbortController(config?.timeout ?? 10000);
    
    try {
      const searchParams = new URLSearchParams();
      
      if (params?.page) searchParams.set('page', String(params.page));
      if (params?.limit) searchParams.set('limit', String(params.limit));
      if (params?.sort) searchParams.set('sort', params.sort);
      if (params?.order) searchParams.set('order', params.order);
      if (params?.search) searchParams.set('search', params.search);
      
      const query = searchParams.toString();
      const endpoint = query ? `${API_ENDPOINTS.ACTIVITY_LOGS}?${query}` : API_ENDPOINTS.ACTIVITY_LOGS;
      
      return await api.get<PaginatedActivityLogs>(endpoint, {
        signal: config?.signal ?? controller.signal,
      });
    } finally {
      clear();
    }
  },

  /**
   * Get all activity logs for export (no pagination)
   */
  async getAllForExport(params?: ActivityLogParams, config?: ServiceConfig): Promise<ActivityLog[]> {
    const { controller, clear } = createAbortController(config?.timeout ?? 30000);
    
    try {
      const searchParams = new URLSearchParams();
      
      if (params?.sort) searchParams.set('sort', params.sort);
      if (params?.order) searchParams.set('order', params.order);
      if (params?.search) searchParams.set('search', params.search);
      
      const query = searchParams.toString();
      const endpoint = query 
        ? `${API_ENDPOINTS.ACTIVITY_LOGS}/export?${query}` 
        : `${API_ENDPOINTS.ACTIVITY_LOGS}/export`;
      
      return await api.get<ActivityLog[]>(endpoint, {
        signal: config?.signal ?? controller.signal,
      });
    } finally {
      clear();
    }
  }
};
