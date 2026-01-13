/**
 * Eruda mobile debugger initialization
 * Only loads in development mode or when ?debug=true is in URL
 * Note: eruda is excluded from production builds to reduce bundle size
 */
/// <reference types="vite/client" />

import { logger } from './logger';

export async function initEruda(): Promise<void> {
  const isDev = import.meta.env.MODE === 'development';
  const urlParams = new URLSearchParams(window.location.search);
  const debugParam = urlParams.get('debug') === 'true';

  // Only load eruda in development or with debug flag
  // In production, eruda is excluded from the bundle
  if (isDev || debugParam) {
    try {
      const eruda = await import('eruda');
      eruda.default.init();
      logger.info('Eruda', 'Mobile debugger initialized');
    } catch {
      // Silently fail in production (eruda is not bundled)
      if (isDev) {
        logger.warn('Eruda', 'Failed to load debugger');
      }
    }
  }
}
