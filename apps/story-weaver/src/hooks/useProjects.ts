import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { videoProjectService } from '@/services/project.service';
import { VideoProjectListParams, CreateVideoProjectInput, UpdateVideoProjectInput } from '@superapp/shared-types';

export const useVideoProjects = (params: VideoProjectListParams = {}) => {
  const query = useQuery({
    queryKey: ['video_projects', 'list', params], // Updated to match useResource pattern
    queryFn: () => videoProjectService.getPage(params),
    placeholderData: (previousData) => previousData
  });

  return {
    ...query,
    projects: query.data?.items || [],
    total: query.data?.total || 0
  };
};

export const useVideoProject = (id: string) => {
    return useQuery({
        queryKey: ['video_projects', 'detail', id], // Updated to consistent pattern
        queryFn: () => videoProjectService.getById(id),
        enabled: !!id
    });
};

export const useCreateVideoProject = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateVideoProjectInput) => videoProjectService.create(data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['video_projects'] });
    }
  });
};

export const useUpdateVideoProject = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string, data: UpdateVideoProjectInput }) => videoProjectService.update(id, data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['video_projects'] });
    }
  });
};

export const useGenerateVideoScript = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (topic: string) => videoProjectService.generateScript(topic),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['video_projects'] });
    }
  });
};

export const useRenderVideo = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (projectId: string) => videoProjectService.renderVideo(projectId),
    onSuccess:  async () => {
      // Invalidate to refetch project status
      await queryClient.invalidateQueries({ queryKey: ['video_projects'] });
    }
  });
};
