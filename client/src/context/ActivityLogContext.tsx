import React, { useState, useEffect, useCallback } from 'react';
import { activityLogService } from '@/services';
import type { ActivityLog } from '@/types';
import { logger } from '@/utils';
import { ActivityLogContext } from './ActivityLogContext.base';
import { useRealtime } from './RealtimeContext';
import { useAuth } from '@/hooks';

export const ActivityLogProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Hardcoded limit to the max used in app (20 from NotificationCenter)
  const limit = 10;

  const fetchLogs = useCallback(async (options?: { page?: number; isLoadMore?: boolean }) => {
    const isLoadMore = options?.isLoadMore ?? false;
    const targetPage = options?.page ?? 1;

    try {
      if (isLoadMore) {
        setIsLoadingMore(true);
      } else {
        setIsLoading(true);
      }

      const result = await activityLogService.getLogs({
        page: targetPage,
        limit,
        sort: 'created',
        order: 'desc'
      });

      if (isLoadMore) {
        setLogs(prev => [...prev, ...result.items]);
      } else {
        setLogs(result.items);
      }
      
      setPage(targetPage);
      setHasMore(result.page < result.totalPages);
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch activity logs';
      logger.error('ActivityLogContext', 'Failed to fetch logs:', err);
      setError(message);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, []); // Removed 'page' dependency

  // Subscribe to real-time updates via RealtimeContext
  const { subscribe } = useRealtime();

  useEffect(() => {
    if (!isAuthenticated) {
      setLogs([]);
      setUnreadCount(0);
      return;
    }

    void fetchLogs({ page: 1 });

    const unsubscribe = subscribe('activity_log', (data) => {
        try {
            const newLog = data as ActivityLog;
            setLogs((prev) => {
              if (prev.some(l => l.id === newLog.id)) return prev;
              const updated = [newLog, ...prev];
              // Don't truncate if we have loaded more pages, but slicing might be safer for memory
              // adhering to "infinite scroll" pattern usually implies keeping data
              return updated;
            });
            setUnreadCount((prev) => prev + 1);
        } catch (err) {
            logger.error('ActivityLogContext', 'Failed to process activity_log event:', err);
        }
    });

    return () => {
        unsubscribe();
    };
  }, [fetchLogs, subscribe, isAuthenticated]);

  const resetUnreadCount = useCallback(() => {
    setUnreadCount(0);
  }, []);

  const loadMore = useCallback(async () => {
    if (!hasMore || isLoadingMore) return;
    await fetchLogs({ page: page + 1, isLoadMore: true });
  }, [hasMore, isLoadingMore, fetchLogs, page]);

  const value = {
    logs,
    isLoading,
    error,
    unreadCount,
    resetUnreadCount,
    refetch: async () => fetchLogs({ page: 1 }),
    loadMore,
    hasMore,
    isLoadingMore
  };

  return (
    <ActivityLogContext.Provider value={value}>
      {children}
    </ActivityLogContext.Provider>
  );
};
