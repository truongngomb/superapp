import { BaseService, api } from '@superapp/core-logic';
import { API_ENDPOINTS } from '@/config';
import { VideoScene } from '@/types';

class VideoSceneService extends BaseService<VideoScene> {
  protected get endpoint(): string {
    return API_ENDPOINTS.VIDEO_SCENES;
  }

  async getByProject(projectId: string): Promise<VideoScene[]> {
    const response = await api.get<VideoScene[]>(`${this.endpoint}/by-project/${projectId}`);
    return response;
  }
}

export const videoSceneService = new VideoSceneService();
