import { useContext } from 'react';
import { activityLogService } from '@/services';
import type { ActivityLog, ActivityLogParams } from '@superapp/shared-types';
import { ActivityLogContext } from '@/context/ActivityLogContext.base';
import { useResource } from '@/hooks/useResource';
import type { ResourceService } from '@/hooks/useResourceService';

/**
 * useActivityLogContext Hook
 * Access the global activity log context (used for Notifications)
 */
export function useActivityLogContext() {
  const context = useContext(ActivityLogContext);
  if (!context) {
    throw new Error('useActivityLogContext must be used within ActivityLogProvider');
  }
  return context;
}

/**
 * useActivityLogs Hook
 * Refactored to use useResource in Read-Only mode
 */
export function useActivityLogs() {
  const {
    items: logs,
    loading,
    isLoadingMore,
    total,
    queryParams,
    fetchItems, // Alias this to fetchLogs if preferred
    exporting,
    getAllForExport,
  } = useResource<ActivityLog, unknown, unknown, ActivityLogParams>({
    service: activityLogService as unknown as ResourceService<ActivityLog, unknown, unknown, ActivityLogParams>,
    resourceName: 'activity_logs', // Matches 'activity_logs' namespace in i18n
    initialParams: {
      page: 1,
      limit: 10,
      sort: 'created',
      order: 'desc',
    },
  });

  return {
    logs,
    loading,
    isLoadingMore,
    pagination: {
      page: queryParams.page || 1,
      totalPages: Math.ceil(total / (queryParams.limit || 10)),
      total,
    },
    exporting,
    fetchLogs: fetchItems,
    getAllForExport,
    queryParams,
  };
}
