import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { videoSceneService } from '@/services/scene.service';
import { CreateVideoSceneInput, UpdateVideoSceneInput } from '@superapp/shared-types';

export const useVideoScenes = (projectId: string) => {
  const query = useQuery({
    queryKey: ['video-scenes', projectId],
    queryFn: () => videoSceneService.getByProject(projectId),
    enabled: !!projectId
  });

  return {
    ...query,
    scenes: query.data?.items || [],
  };
};

export const useCreateVideoScene = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateVideoSceneInput) => videoSceneService.create(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['video-scenes', variables.project_id] });
    }
  });
};

export const useUpdateVideoScene = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string, data: UpdateVideoSceneInput }) => videoSceneService.update(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['video-scenes', data.project_id] });
    }
  });
};

export const useDeleteVideoScene = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => videoSceneService.delete(id),
        onSuccess: () => {
             // Invalidate all scenes queries since we don't know the project ID easily here
             // Ideally we pass projectId to onSuccess to invalidate specifically
             queryClient.invalidateQueries({ queryKey: ['video-scenes'] });
        }
    })
}
