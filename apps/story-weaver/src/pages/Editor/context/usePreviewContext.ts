/**
 * usePreviewContext Hook
 * 
 * Separated from PreviewContext.tsx for React Fast Refresh compatibility.
 */
import { useContext } from 'react';
import { PreviewContext } from './PreviewContext';
import type { PreviewContextValue } from './PreviewContext';

/**
 * Hook to access PreviewContext - throws if used outside Provider
 */
export const usePreviewContext = (): PreviewContextValue => {
  const context = useContext(PreviewContext);
  if (!context) {
    throw new Error('usePreviewContext must be used within a PreviewProvider');
  }
  return context;
};

/**
 * Optional hook that doesn't throw - for conditional usage
 */
export const usePreviewContextOptional = (): PreviewContextValue | null => {
  return useContext(PreviewContext);
};
