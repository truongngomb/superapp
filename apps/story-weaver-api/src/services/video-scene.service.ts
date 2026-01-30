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
      projectId: record['projectId'] as string,
      characterIds: (record['characterIds'] as string[]) || [],
      order: (record['order'] as number) || 0,
      estimatedDuration: (record['estimatedDuration'] as number) || 0,
      scriptText: (record['scriptText'] as string) || '',
      voiceover: (record['voiceover'] as string) || '',
      textOverlay: (record['textOverlay'] as string) || '',
      visualPrompt: (record['visualPrompt'] as string) || '',
      cameraMovement: record['cameraMovement'] as VideoScene['cameraMovement'],
      keyframeOptions: (record['keyframeOptions'] as VideoScene['keyframeOptions']) || [],
      selectedKeyframe: (record['selectedKeyframe'] as string) || '',
      imageUrl: (record['imageUrl'] as string) || '',
      audioUrl: (record['audioUrl'] as string) || '',
      videoUrl: (record['videoUrl'] as string) || '',
      videoClipUrl: (record['videoClipUrl'] as string) || '',
      duration: (record['duration'] as number) || 0,
      status: record['status'] as VideoScene['status'],
      metadata: (record['metadata'] as VideoScene['metadata']) || {},
      isActive: (record['isActive'] as boolean) ?? true,
      isDeleted: (record['isDeleted'] as boolean) || false,
      created: record['created'] as string,
      updated: record['updated'] as string,
    };
  }

  protected override mapToRecord(input: Partial<VideoScene>): Record<string, unknown> {
    const record: Record<string, unknown> = {};

    if (input.projectId !== undefined) record['projectId'] = input.projectId;
    if (input.characterIds !== undefined) record['characterIds'] = input.characterIds;
    if (input.order !== undefined) record['order'] = input.order;
    if (input.estimatedDuration !== undefined) record['estimatedDuration'] = input.estimatedDuration;
    if (input.scriptText !== undefined) record['scriptText'] = input.scriptText;
    if (input.voiceover !== undefined) record['voiceover'] = input.voiceover;
    if (input.textOverlay !== undefined) record['textOverlay'] = input.textOverlay;
    if (input.visualPrompt !== undefined) record['visualPrompt'] = input.visualPrompt;
    if (input.cameraMovement !== undefined) record['cameraMovement'] = input.cameraMovement;
    if (input.keyframeOptions !== undefined) record['keyframeOptions'] = input.keyframeOptions;
    if (input.selectedKeyframe !== undefined) record['selectedKeyframe'] = input.selectedKeyframe;
    if (input.imageUrl !== undefined) record['imageUrl'] = input.imageUrl;
    if (input.audioUrl !== undefined) record['audioUrl'] = input.audioUrl;
    if (input.videoUrl !== undefined) record['videoUrl'] = input.videoUrl;
    if (input.videoClipUrl !== undefined) record['videoClipUrl'] = input.videoClipUrl;
    if (input.duration !== undefined) record['duration'] = input.duration;
    if (input.status !== undefined) record['status'] = input.status;
    if (input.metadata !== undefined) record['metadata'] = input.metadata;
    if (input.isActive !== undefined) record['isActive'] = input.isActive;
    if (input.isDeleted !== undefined) record['isDeleted'] = input.isDeleted;

    return record;
  }

  /**
   * Get all scenes for a project, sorted by order
   */
  async getByProject(projectId: string): Promise<VideoScene[]> {
    return this.getAllFiltered({
      filter: `projectId = "${projectId}"`,
      sort: 'order',
      order: 'asc'
    });
  }
}

export const videoSceneService = new VideoSceneService();
