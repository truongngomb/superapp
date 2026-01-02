import React, { useState, useEffect, useCallback } from 'react';
import { activityLogService } from '@/services';
import type { ActivityLog } from '@/types';
import { logger } from '@/utils';
import { ActivityLogContext } from './ActivityLogContext.base';
import { useRealtime } from './RealtimeContext';
export const ActivityLogProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  // Hardcoded limit to the max used in app (20 from NotificationCenter)
  const limit = 20;

  const fetchLogs = useCallback(async () => {
    try {
      setIsLoading(true);
      const result = await activityLogService.getLogs({
        limit,
        sort: 'created',
        order: 'desc'
      });
      setLogs(result.items);
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch activity logs';
      logger.error('ActivityLogContext', 'Failed to fetch logs:', err);
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Subscribe to real-time updates via RealtimeContext
  const { subscribe } = useRealtime();

  useEffect(() => {
    void fetchLogs();

    const unsubscribe = subscribe('activity_log', (data) => {
        try {
            const newLog = data as ActivityLog;
            setLogs((prev) => {
              if (prev.some(l => l.id === newLog.id)) return prev;
              const updated = [newLog, ...prev];
              return updated.slice(0, limit);
            });
            setUnreadCount((prev) => prev + 1);
        } catch (err) {
            logger.error('ActivityLogContext', 'Failed to process activity_log event:', err);
        }
    });

    return () => {
        unsubscribe();
    };
  }, [fetchLogs, subscribe]);

  const resetUnreadCount = useCallback(() => {
    setUnreadCount(0);
  }, []);

  const value = {
    logs,
    isLoading,
    error,
    unreadCount,
    resetUnreadCount,
    refetch: fetchLogs
  };

  return (
    <ActivityLogContext.Provider value={value}>
      {children}
    </ActivityLogContext.Provider>
  );
};
