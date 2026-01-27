import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { videoProjectService } from '@/services/project.service';
import { VideoProjectListParams, CreateVideoProjectInput, UpdateVideoProjectInput } from '@superapp/shared-types';

export const useVideoProjects = (params: VideoProjectListParams = {}) => {
  const query = useQuery({
    queryKey: ['video-projects', params],
    queryFn: () => videoProjectService.getPage(params)
  });

  return {
    ...query,
    projects: query.data?.items || [],
    total: query.data?.total || 0
  };
};

export const useVideoProject = (id: string) => {
    return useQuery({
        queryKey: ['video-project', id],
        queryFn: () => videoProjectService.getById(id),
        enabled: !!id
    });
};

export const useCreateVideoProject = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateVideoProjectInput) => videoProjectService.create(data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['video-projects'] });
    }
  });
};

export const useUpdateVideoProject = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string, data: UpdateVideoProjectInput }) => videoProjectService.update(id, data),
    onSuccess: async (_, { id }) => {
      await queryClient.invalidateQueries({ queryKey: ['video-projects'] });
      await queryClient.invalidateQueries({ queryKey: ['video-project', id] });
    }
  });
};

export const useGenerateVideoScript = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (topic: string) => videoProjectService.generateScript(topic),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['video-projects'] });
    }
  });
};

export const useRenderVideo = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (projectId: string) => videoProjectService.renderVideo(projectId),
    onSuccess:  async (_, projectId) => {
      // Invalidate to refetch project status
      await queryClient.invalidateQueries({ queryKey: ['video-project', projectId] });
      await queryClient.invalidateQueries({ queryKey: ['video-projects'] });
    }
  });
};
