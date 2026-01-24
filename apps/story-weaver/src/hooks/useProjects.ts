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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['video-projects'] });
    }
  });
};

export const useUpdateVideoProject = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string, data: UpdateVideoProjectInput }) => videoProjectService.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['video-projects'] });
      queryClient.invalidateQueries({ queryKey: ['video-project', id] });
    }
  });
};

export const useGenerateVideoScript = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (topic: string) => videoProjectService.generateScript(topic),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['video-projects'] });
    }
  });
};

export const useRenderVideo = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (projectId: string) => videoProjectService.renderVideo(projectId),
    onSuccess: (_, projectId) => {
      // Invalidate to refetch project status
      queryClient.invalidateQueries({ queryKey: ['video-project', projectId] });
      queryClient.invalidateQueries({ queryKey: ['video-projects'] });
    }
  });
};
