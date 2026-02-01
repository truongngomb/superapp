import { BaseService } from '@superapp/core-logic';
import { API_ENDPOINTS } from '@/config';
import type { VideoProject } from '@/types';

class VideoProjectService extends BaseService<VideoProject> {
  protected get endpoint(): string {
    return API_ENDPOINTS.VIDEO_PROJECTS;
  }

  async generateScript(topic: string) {
    // Dynamic import to avoid circular dependency if any, though import at top level is safer usually if no cycle.
    // Using simple api.post is better.
    const { api } = await import('@/config');
    return await api.post<{ projectId: string, scenesCount: number }>(
      `${this.endpoint}/generate-script`, 
      { topic }
    );
  }

  async renderVideo(projectId: string) {
    const { api } = await import('@/config');
    return await api.post<{ message: string }>(
      `${this.endpoint}/${projectId}/render`
    );
  }

  /**
   * Call AI to summarize story content into a short description
   */
  async summarizeDescription(projectId: string): Promise<string> {
    const { api, API_ENDPOINTS } = await import('@/config');
    const result = await api.post<{ description: string }>(
      `${API_ENDPOINTS.GENERATION}/summarize-description/${projectId}`
    );
    return result.description;
  }
}

export const videoProjectService = new VideoProjectService();
