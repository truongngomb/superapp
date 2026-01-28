/**
 * TanStack Query Client Configuration
 * 
 * Centralized configuration for React Query with optimal defaults
 * for Story Weaver video generation use cases.
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
  // Video Projects
  videoProjects: {
    all: ['video_projects'] as const,
    lists: () => [...queryKeys.videoProjects.all, 'list'] as const,
    list: (params: Record<string, unknown>) => [...queryKeys.videoProjects.lists(), params] as const,
    details: () => [...queryKeys.videoProjects.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.videoProjects.details(), id] as const,
  },

  // Video Scenes
  videoScenes: {
    all: ['video_scenes'] as const,
    lists: () => [...queryKeys.videoScenes.all, 'list'] as const,
    list: (params: Record<string, unknown>) => [...queryKeys.videoScenes.lists(), params] as const,
    details: () => [...queryKeys.videoScenes.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.videoScenes.details(), id] as const,
    byProject: (projectId: string) => [...queryKeys.videoScenes.all, 'project', projectId] as const,
  },
  
  // Settings
  settings: {
    all: ['settings'] as const,
    public: () => [...queryKeys.settings.all, 'public'] as const,
  },

    // Users (needed for Auth)
  users: {
      all: ['users'] as const,
      detail: (id: string) => [...queryKeys.users.all, 'detail', id] as const,
  }
} as const;

// Type for query keys
export type QueryKeys = typeof queryKeys;
