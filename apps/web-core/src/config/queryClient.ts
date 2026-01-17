/**
 * TanStack Query Client Configuration
 * 
 * Centralized configuration for React Query with optimal defaults
 * for admin dashboard use cases.
 */

import { QueryClient } from '@tanstack/react-query';

/**
 * Default options for queries and mutations
 * 
 * staleTime: 30 seconds - Data is considered fresh for 30s
 * gcTime: 5 minutes - Unused data is garbage collected after 5m
 * retry: 1 - Retry failed requests once
 * refetchOnWindowFocus: true - Refetch when user returns to tab
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Data freshness: 30 seconds for list data
      staleTime: 30 * 1000,
      
      // Garbage collection: 5 minutes
      gcTime: 5 * 60 * 1000,
      
      // Retry failed requests once
      retry: 1,
      
      // Refetch when window regains focus
      refetchOnWindowFocus: true,
      
      // Refetch when network reconnects
      refetchOnReconnect: true,
      
      // Don't refetch on mount if data is fresh
      refetchOnMount: true,
    },
    mutations: {
      // Don't retry mutations (user should retry manually)
      retry: 0,
    },
  },
});

/**
 * Query key factory for consistent key management
 * 
 * Usage:
 * - queryKeys.categories.all - Invalidate all category queries
 * - queryKeys.categories.list(params) - Specific list query
 * - queryKeys.categories.detail(id) - Specific detail query
 */
export const queryKeys = {
  // Categories
  categories: {
    all: ['categories'] as const,
    lists: () => [...queryKeys.categories.all, 'list'] as const,
    list: (params: Record<string, unknown>) => [...queryKeys.categories.lists(), params] as const,
    details: () => [...queryKeys.categories.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.categories.details(), id] as const,
    export: (params?: Record<string, unknown>) => [...queryKeys.categories.all, 'export', params] as const,
  },
  
  // Users
  users: {
    all: ['users'] as const,
    lists: () => [...queryKeys.users.all, 'list'] as const,
    list: (params: Record<string, unknown>) => [...queryKeys.users.lists(), params] as const,
    details: () => [...queryKeys.users.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.users.details(), id] as const,
    export: (params?: Record<string, unknown>) => [...queryKeys.users.all, 'export', params] as const,
  },
  
  // Roles
  roles: {
    all: ['roles'] as const,
    lists: () => [...queryKeys.roles.all, 'list'] as const,
    list: (params: Record<string, unknown>) => [...queryKeys.roles.lists(), params] as const,
    details: () => [...queryKeys.roles.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.roles.details(), id] as const,
    export: (params?: Record<string, unknown>) => [...queryKeys.roles.all, 'export', params] as const,
  },
  
  // Activity Logs
  activityLogs: {
    all: ['activityLogs'] as const,
    lists: () => [...queryKeys.activityLogs.all, 'list'] as const,
    list: (params: Record<string, unknown>) => [...queryKeys.activityLogs.lists(), params] as const,
  },
  
  // Settings
  settings: {
    all: ['settings'] as const,
    public: () => [...queryKeys.settings.all, 'public'] as const,
  },
} as const;

// Type for query keys
export type QueryKeys = typeof queryKeys;
