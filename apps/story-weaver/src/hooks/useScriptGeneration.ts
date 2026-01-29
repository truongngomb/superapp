/**
 * useScriptGeneration Hook
 * 
 * Manages AI script generation for video projects.
 * Calls backend to generate scenes from story content.
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@superapp/core-logic';
import { API_ENDPOINTS } from '@/config';
import { queryKeys } from '@/config/queryClient';
import type { VideoScene } from '@/types';
import type { ApiResponse } from '@superapp/shared-types';

interface GenerateScenesParams {
  projectId: string;
}

interface GenerateScenesResponse {
  success: boolean;
  data: VideoScene[];
}

/**
 * Hook we generate AI script/scenes for a project
 * 
 * @example
 * const { generateScript, isGenerating } = useScriptGeneration();
 * 
 * // Trigger generation
 * generateScript({ projectId: 'abc123' });
 */
export const useScriptGeneration = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({ projectId }: GenerateScenesParams): Promise<VideoScene[]> => {
      const response = await api.post<ApiResponse<GenerateScenesResponse>>(
        `${API_ENDPOINTS.GENERATION}/generate-scenes/${projectId}`
      );
      
      // Handle nested response structure
      const responseData = response.data;
      return responseData.data;
    },
    onSuccess: (_data, variables) => {
      // Invalidate scenes query to refresh the list
      void queryClient.invalidateQueries({ 
        queryKey: queryKeys.videoScenes.byProject(variables.projectId) 
      });
      
      // Also invalidate project detail to update phase/status
      void queryClient.invalidateQueries({ 
        queryKey: queryKeys.videoProjects.detail(variables.projectId) 
      });
    },
  });

  return {
    generateScript: mutation.mutate,
    generateScriptAsync: mutation.mutateAsync,
    isGenerating: mutation.isPending,
    error: mutation.error,
    reset: mutation.reset,
  };
};
