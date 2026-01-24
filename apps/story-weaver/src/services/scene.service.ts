import { BaseService } from './base.service';
import { API_ENDPOINTS } from '@/config';
import { VideoScene } from '@superapp/shared-types';

class VideoSceneService extends BaseService<VideoScene> {
  protected get endpoint(): string {
    return API_ENDPOINTS.VIDEO_SCENES;
  }

  async getByProject(projectId: string) {
      return this.getPage({ projectId });
  }
}

export const videoSceneService = new VideoSceneService();
