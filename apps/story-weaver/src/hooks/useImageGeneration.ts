/**
 * useImageGeneration Hook
 * 
 * Manages AI image generation for scene keyframes.
 * Handles generation and selection of keyframes.
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@superapp/core-logic';
import { API_ENDPOINTS } from '@/config';
import { queryKeys } from '@/config/queryClient';
import type { KeyframeOption } from '@/types/scene-script';
import type { ApiResponse } from '@superapp/shared-types';

interface GenerateImageParams {
  sceneId: string;
  projectId: string; // Needed for cache invalidation
}

export const useImageGeneration = () => {
  const queryClient = useQueryClient();

  const generateMutation = useMutation({
    mutationFn: async ({ sceneId }: GenerateImageParams): Promise<KeyframeOption[]> => {
      const response = await api.post<ApiResponse<KeyframeOption[]>>(
        `${API_ENDPOINTS.GENERATION}/generate-images/${sceneId}`
      );
      
      if (Array.isArray(response.data)) {
        return response.data;
      }
      return [];
    },
    onSuccess: (_data, variables) => {
      // Invalidate scenes of the project to update UI
      void queryClient.invalidateQueries({
        queryKey: queryKeys.videoScenes.byProject(variables.projectId)
      });
    },
  });

  return {
    generateImages: generateMutation.mutate,
    generateImagesAsync: generateMutation.mutateAsync,
    isGenerating: generateMutation.isPending,
    error: generateMutation.error,
    reset: generateMutation.reset,
  };
};
