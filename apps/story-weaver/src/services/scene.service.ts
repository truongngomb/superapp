import { BaseService } from '@superapp/core-logic';
import { API_ENDPOINTS } from '@/config';
import type { VideoScene, PaginatedResponse } from '@superapp/shared-types';

class VideoSceneService extends BaseService<VideoScene> {
  protected get endpoint(): string {
    return API_ENDPOINTS.VIDEO_SCENES;
  }

  async getByProject(projectId: string): Promise<PaginatedResponse<VideoScene>> {
    return await this.getPage({ projectId });
  }
}

export const videoSceneService = new VideoSceneService();
