/**
 * Video Scene Service
 * 
 * Handles CRUD operations for video scenes.
 */
import { BaseService } from './base.service.js';
import { Collections, CacheKeys } from '../config/index.js';
import type { VideoScene } from '@superapp/shared-types';

class VideoSceneService extends BaseService<VideoScene> {
  protected readonly collectionName = Collections.VIDEO_SCENES;
  protected readonly cacheKey = CacheKeys.VIDEO_SCENES;
  
  protected readonly defaultFilter = 'isDeleted = false';

  protected mapRecord(record: Record<string, unknown>): VideoScene {
    return {
      id: record['id'] as string,
      project_id: record['project_id'] as string,
      order: record['order'] as number,
      script_text: (record['script_text'] as string) || '',
      visual_prompt: (record['visual_prompt'] as string) || '',
      image_url: (record['image_url'] as string) || '',
      audio_url: (record['audio_url'] as string) || '',
      duration: (record['duration'] as number) || 0,
      transition: (record['transition'] as string) || '',
      isActive: record['isActive'] as boolean,
      isDeleted: (record['isDeleted'] as boolean) || false,
      created: record['created'] as string,
      updated: record['updated'] as string,
    };
  }

  /**
   * Get all scenes for a project sorted by order
   */
  async getByProjectId(projectId: string): Promise<VideoScene[]> {
    return this.getAllFiltered({
      filter: `project_id = "${projectId}" && isDeleted = false`,
      sort: 'order',
      order: 'asc'
    });
  }
}

export const videoSceneService = new VideoSceneService();
