import { useContext } from 'react';
import { ActivityLogContext } from '../context/ActivityLogContext.base';

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
