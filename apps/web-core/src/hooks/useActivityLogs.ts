import { activityLogService } from '@/services';
import type { ActivityLog, ActivityLogParams } from '@superapp/shared-types';
import { useResource } from '@/hooks';
import type { ResourceService } from '@superapp/core-logic';

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
    fetchItems,
    exporting,
    getAllForExport,
  } = useResource<ActivityLog, unknown, unknown, ActivityLogParams>({
    service: activityLogService as unknown as ResourceService<ActivityLog, unknown, unknown, ActivityLogParams>,
    resourceName: 'activity_logs',
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
