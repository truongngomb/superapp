import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { videoProjectService } from '@/services/project.service';
import { queryKeys } from '@/config/queryClient';
import type { CreateVideoProjectInput } from '@/types';


export const useVideoProject = (id: string) => {
    return useQuery({
        queryKey: queryKeys.videoProjects.detail(id || ''),
        queryFn: () => videoProjectService.getById(id),
        enabled: !!id
    });
};

export const useCreateVideoProject = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateVideoProjectInput) => videoProjectService.create(data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.videoProjects.all });
    }
  });
};

export const useGenerateVideoScript = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (topic: string) => videoProjectService.generateScript(topic),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.videoProjects.all });
    }
  });
};

