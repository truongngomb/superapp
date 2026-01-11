/**
 * useSettings Hook
 * Hook for consuming system settings from Context
 */
import { useContext } from 'react';
import { SettingsContext } from '@/context/SettingsContext.base';

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
