/**
 * Video Project Service
 * 
 * Handles CRUD operations for video projects using local BaseService
 */
import { BaseService } from './base.service.js';
import type { VideoProject } from '../types/index.js';
import { Collections, CacheKeys } from '../config/index.js';

class VideoProjectService extends BaseService<VideoProject> {
  protected readonly collectionName = Collections.VIDEO_PROJECTS;
  protected readonly cacheKey = CacheKeys.VIDEO_PROJECTS;
  
  // Default filter: only active and not deleted
  protected readonly defaultFilter = 'isDeleted = false';

  protected mapRecord(record: Record<string, unknown>): VideoProject {
    return {
      id: record['id'] as string,
      name: record['name'] as string,
      description: (record['description'] as string) || '',
      status: record['status'] as VideoProject['status'],
      settings: (record['settings'] as VideoProject['settings']) || { aspectRatio: '9:16' },
      // New Phase 1 fields
      storyContent: (record['story_content'] as string) || '',
      aspectRatio: record['aspect_ratio'] as VideoProject['aspectRatio'],
      targetPlatform: record['target_platform'] as VideoProject['targetPlatform'],
      targetDuration: (record['target_duration'] as number) || 0,
      currentPhase: record['current_phase'] as VideoProject['currentPhase'],
      userId: record['user_id'] as string,
      isActive: record['isActive'] as boolean,
      isDeleted: (record['isDeleted'] as boolean) || false,
      created: record['created'] as string,
      updated: record['updated'] as string,
    };
  }
}

export const videoProjectService = new VideoProjectService();
