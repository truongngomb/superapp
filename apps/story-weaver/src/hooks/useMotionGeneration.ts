/**
 * useMotionGeneration Hook
 * 
 * Manages AI motion clip generation for scenes.
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@superapp/core-logic';
import { API_ENDPOINTS } from '@/config';
import { queryKeys } from '@/config/queryClient';
import type { ApiResponse } from '@superapp/shared-types';

interface GenerateMotionParams {
  sceneId: string;
  projectId: string; // Needed for cache invalidation
}

export interface MotionResult {
  sceneId: string;
  videoClipUrl: string;
  duration: number;
  generatedAt: string;
}

export const useMotionGeneration = () => {
  const queryClient = useQueryClient();

  const generateMutation = useMutation({
    mutationFn: async ({ sceneId }: GenerateMotionParams): Promise<MotionResult | null> => {
      const response = await api.post<ApiResponse<MotionResult>>(
        `${API_ENDPOINTS.GENERATION}/generate-motion/${sceneId}`
      );
      
      return response.data;
    },
    onSuccess: (_data, variables) => {
      // Invalidate scenes of the project to update UI with videoClipUrl
      void queryClient.invalidateQueries({
        queryKey: queryKeys.videoScenes.byProject(variables.projectId)
      });
    },
  });

  return {
    generateMotion: generateMutation.mutate,
    generateMotionAsync: generateMutation.mutateAsync,
    isGenerating: generateMutation.isPending,
    error: generateMutation.error,
    reset: generateMutation.reset,
  };
};
