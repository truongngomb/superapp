import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { videoSceneService } from '@/services/scene.service';
import { queryKeys } from '@/config/queryClient';

export const useVideoScenes = (projectId: string) => {
  const query = useQuery({
    queryKey: queryKeys.videoScenes.byProject(projectId),
    queryFn: () => videoSceneService.getByProject(projectId),
    placeholderData: (previousData) => previousData,
    enabled: !!projectId
  });

  return {
    ...query,
    scenes: query.data?.items || [],
  };
};


export const useDeleteVideoScene = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => videoSceneService.delete(id),
        onSuccess: () => {
             // Invalidate all scenes queries since we don't know the project ID easily here
             // Ideally we pass projectId to onSuccess to invalidate specifically
             void queryClient.invalidateQueries({ queryKey: queryKeys.videoScenes.all });
        }
    })
}
