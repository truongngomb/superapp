/**
 * Video Scene Service
 * 
 * Handles CRUD operations for video scenes using BaseService.
 */
import { BaseService } from './base.service.js';
import type { VideoScene } from '../types/index.js';
import { Collections, CacheKeys } from '../config/index.js';

class VideoSceneService extends BaseService<VideoScene> {
  protected readonly collectionName = Collections.VIDEO_SCENES;
  protected readonly cacheKey = CacheKeys.VIDEO_SCENES;
  
  // Default filter: only not deleted
  protected readonly defaultFilter = 'isDeleted = false';

  protected mapRecord(record: Record<string, unknown>): VideoScene {
    return {
      id: record['id'] as string,
      projectId: record['project_id'] as string,
      characterIds: (record['character_ids'] as string[]) || [],
      order: (record['order'] as number) || 0,
      estimatedDuration: (record['estimated_duration'] as number) || 0,
      scriptText: (record['script_text'] as string) || '',
      voiceover: (record['voiceover'] as string) || '',
      textOverlay: (record['text_overlay'] as string) || '',
      visualPrompt: (record['visual_prompt'] as string) || '',
      cameraMovement: record['camera_movement'] as VideoScene['cameraMovement'],
      keyframeOptions: (record['keyframe_options'] as VideoScene['keyframeOptions']) || [],
      selectedKeyframe: (record['selected_keyframe'] as string) || '',
      imageUrl: (record['image_url'] as string) || '',
      audioUrl: (record['audio_url'] as string) || '',
      videoUrl: (record['video_url'] as string) || '',
      videoClipUrl: (record['video_clip_url'] as string) || '',
      duration: (record['duration'] as number) || 0,
      status: record['status'] as VideoScene['status'],
      metadata: (record['metadata'] as VideoScene['metadata']) || {},
      isActive: (record['isActive'] as boolean) ?? true,
      isDeleted: (record['isDeleted'] as boolean) || false,
      created: record['created'] as string,
      updated: record['updated'] as string,
    };
  }

  /**
   * Get all scenes for a project, sorted by order
   */
  async getByProject(projectId: string): Promise<VideoScene[]> {
    return this.getAllFiltered({
      filter: `project_id = "${projectId}"`,
      sort: 'order',
      order: 'asc'
    });
  }
}

export const videoSceneService = new VideoSceneService();
