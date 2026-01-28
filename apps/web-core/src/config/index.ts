/**
 * Config Module Exports
 */

// Environment configuration
export { env, validateEnv } from './env';

// Constants
export * from './constants';

// API client
export { 
  api, 
  ApiException,
  addRequestInterceptor,
  addResponseInterceptor,
  createAbortController,
} from '@superapp/core-logic';

export type {
  ApiResponse,
  RequestConfig,
  ApiErrorData,
} from '@superapp/shared-types';

// TanStack Query
export { queryClient, queryKeys, type QueryKeys } from './queryClient';

// Internationalization
export { default as i18n } from './i18n';

// Navigation
export * from './navigation';
