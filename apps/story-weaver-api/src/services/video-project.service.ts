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
      // New Phase 1 fields (now camelCase in DB)
      storyContent: (record['storyContent'] as string) || '',
      aspectRatio: record['aspectRatio'] as VideoProject['aspectRatio'],
      targetPlatform: record['targetPlatform'] as VideoProject['targetPlatform'],
      targetDuration: (record['targetDuration'] as number) || 0,
      currentPhase: record['currentPhase'] as VideoProject['currentPhase'],
      userId: record['userId'] as string,
      isActive: (record['isActive'] as boolean) ?? true,
      isDeleted: (record['isDeleted'] as boolean) || false,
      created: record['created'] as string,
      updated: record['updated'] as string,
    };
  }

  protected override mapToRecord(input: Partial<VideoProject>): Record<string, unknown> {
    const record: Record<string, unknown> = {};

    // Map all fields directly (now camelCase in both domain and DB)
    if (input.name !== undefined) record['name'] = input.name;
    if (input.description !== undefined) record['description'] = input.description;
    if (input.status !== undefined) record['status'] = input.status;
    if (input.settings !== undefined) record['settings'] = input.settings;
    if (input.userId !== undefined) record['userId'] = input.userId;
    if (input.isActive !== undefined) record['isActive'] = input.isActive;
    if (input.isDeleted !== undefined) record['isDeleted'] = input.isDeleted;
    
    // Phase 1 fields
    if (input.storyContent !== undefined) record['storyContent'] = input.storyContent;
    if (input.aspectRatio !== undefined) record['aspectRatio'] = input.aspectRatio;
    if (input.targetPlatform !== undefined) record['targetPlatform'] = input.targetPlatform;
    if (input.targetDuration !== undefined) record['targetDuration'] = input.targetDuration;
    if (input.currentPhase !== undefined) record['currentPhase'] = input.currentPhase;

    return record;
  }
}

export const videoProjectService = new VideoProjectService();
