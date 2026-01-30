import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { videoSceneService } from '@/services/scene.service';
import { queryKeys } from '@/config/queryClient';
import type { VideoScene } from '@/types';

export const useVideoScenes = (projectId: string) => {
  const query = useQuery({
    queryKey: queryKeys.videoScenes.byProject(projectId),
    queryFn: () => videoSceneService.getByProject(projectId),
    placeholderData: (previousData) => previousData,
    enabled: !!projectId
  });

  return {
    ...query,
    scenes: query.data || [],
  };
};


export const useDeleteVideoScene = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => videoSceneService.delete(id),
        onSuccess: () => {
          void queryClient.invalidateQueries({ queryKey: queryKeys.videoScenes.all });
        }
    })
}

export const useUpdateVideoScene = (projectId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ sceneId, data }: { sceneId: string; data: Partial<VideoScene> }) => {
      return await videoSceneService.update(sceneId, data);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ 
        queryKey: queryKeys.videoScenes.byProject(projectId) 
      });
    },
  });
};
