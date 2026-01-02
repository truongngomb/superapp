/**
 * useActivityLogs Hook
 * 
 * Now refactored to use the global ActivityLogContext.
 * This ensures we only have one API call and one SSE connection.
 * The 'limit' parameter is kept for backward compatibility but ignored
 * as the context manages a global limit (default 20).
 */
import { useContext } from 'react';
import { ActivityLogContext } from '@/context/ActivityLogContext.base';

export function useActivityLogs(_limit?: number) {
  const context = useContext(ActivityLogContext);
  
  if (!context) {
    throw new Error('useActivityLogs must be used within ActivityLogProvider');
  }

  return context;
}
