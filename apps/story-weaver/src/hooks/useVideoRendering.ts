/**
 * useVideoRendering Hook
 * 
 * Manages final video rendering process for a project.
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@superapp/core-logic';
import { API_ENDPOINTS } from '@/config';
import { queryKeys } from '@/config/queryClient';
import type { ApiResponse } from '@superapp/shared-types';

interface RenderParams {
  projectId: string;
}

export interface RenderResult {
  projectId: string;
  outputUrl: string;
  status: string;
}

export const useVideoRendering = () => {
  const queryClient = useQueryClient();

  const renderMutation = useMutation({
    mutationFn: async ({ projectId }: RenderParams): Promise<RenderResult | null> => {
      const response = await api.post<ApiResponse<RenderResult>>(
        `${API_ENDPOINTS.GENERATION}/render/${projectId}`
      );
      
      return response.data;
    },
    onSuccess: (_data, variables) => {
      // Invalidate project query to refresh status and outputUrl
      void queryClient.invalidateQueries({
        queryKey: queryKeys.videoProjects.detail(variables.projectId)
      });
      // Also invalidate all video project queries to update lists
      void queryClient.invalidateQueries({
        queryKey: queryKeys.videoProjects.all
      });
    },
  });

  return {
    renderVideo: renderMutation.mutate,
    renderVideoAsync: renderMutation.mutateAsync,
    isRendering: renderMutation.isPending,
    error: renderMutation.error,
    reset: renderMutation.reset,
  };
};
