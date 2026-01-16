import { useState, useCallback, useRef, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { activityLogService } from '@/services';
import { useToast } from '@/context';
import type { ActivityLog, ActivityLogParams } from '@superapp/shared-types';
import { logger } from '@/utils';
import { ActivityLogContext } from '@/context/ActivityLogContext.base';

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
 * Logic for Activity Logs page (similar to useCategories)
 */
export function useActivityLogs() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [exporting, setExporting] = useState(false);
  const toast = useToast();
  const { t } = useTranslation(['activity_logs', 'common']);
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Initialize params from URL
  const getInitialParams = (): ActivityLogParams => {
    const params: ActivityLogParams = {
      page: 1,
      limit: 10,
    };
    const page = searchParams.get('page');
    if (page) params.page = parseInt(page, 10);

    const sort = searchParams.get('sort');
    if (sort) params.sort = sort;

    const order = searchParams.get('order');
    if (order === 'asc' || order === 'desc') params.order = order;
    
    const search = searchParams.get('search');
    if (search) params.search = search;
    
    return params;
  };

  // Pagination state
  const [pagination, setPagination] = useState({ 
    page: getInitialParams().page || 1, 
    totalPages: 1, 
    total: 0 
  });
  
  const lastParamsRef = useRef<ActivityLogParams | undefined>(getInitialParams());

  // Use ref to avoid infinite loop when reloading
  const isReloading = useRef(false);

  const fetchLogs = useCallback(async (params?: ActivityLogParams) => {
    // Determine if this is a page change (loadingMore) or initial/filter change
    const isPageChange = params?.page !== undefined && 
      params.page !== 1 && 
      lastParamsRef.current?.page !== params.page;

    // Update last params
    if (params !== undefined) {
      lastParamsRef.current = { ...lastParamsRef.current, ...params };
    }
    
    // Sync URL
    const nextParams = lastParamsRef.current || {};
    
    setSearchParams((prevSearchParams) => {
      const newSearchParams = new URLSearchParams(prevSearchParams);
      
      if (nextParams.page && nextParams.page > 1) newSearchParams.set('page', nextParams.page.toString());
      else newSearchParams.delete('page');
      
      if (nextParams.sort) newSearchParams.set('sort', nextParams.sort);
      else newSearchParams.delete('sort');
      
      if (nextParams.order) newSearchParams.set('order', nextParams.order);
      else newSearchParams.delete('order');
      
      if (nextParams.search) newSearchParams.set('search', nextParams.search);
      else newSearchParams.delete('search');

      return newSearchParams;
    }, { replace: true });

    // Skip if already reloading (prevent loop)
    if (isReloading.current) return;
    
    // Set appropriate loading state
    if (isPageChange) {
      setIsLoadingMore(true);
    } else {
      setLoading(true);
    }

    try {
      const data = await activityLogService.getPage(lastParamsRef.current);
      setLogs(data.items);
      setPagination({
        page: data.page,
        totalPages: data.totalPages,
        total: data.total
      });
    } catch (error) {
      logger.warn('useActivityLogs', 'Failed to load activity logs:', error);
      // Use common load_error from namespace
      toast.error(t('common:toast.load_error', { defaultValue: 'Failed to load activity logs' }));
    } finally {
      setLoading(false);
      setIsLoadingMore(false);
    }
  }, [toast, t, setSearchParams]);

  const getAllForExport = async (params?: ActivityLogParams) => {
    setExporting(true);
    try {
      return await activityLogService.getAllForExport(params);
    } catch (error) {
      logger.warn('useActivityLogs', 'Failed to get logs for export:', error);
      toast.error(t('common:toast.load_error', { defaultValue: 'Failed to load logs for export' }));
      return [];
    } finally {
      setExporting(false);
    }
  };

  return {
    logs,
    pagination,
    loading,
    isLoadingMore,
    exporting,
    fetchLogs,
    getAllForExport,
  };
}
