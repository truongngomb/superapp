/**
 * Video Project Service
 * 
 * Handles CRUD operations for video projects using core-sdk BaseService
 */
import { BaseService } from '@superapp/core-sdk/services';
import type { VideoProject } from '@superapp/shared-types';

import { config } from '../config/env.js';

class VideoProjectService extends BaseService<VideoProject> {
  protected collectionName = 'sw_video_projects';
  protected cacheKey = 'sw_video_projects';

  constructor() {
    super({
      pocketbaseUrl: config.pocketbase.url,
      adminEmail: config.pocketbase.adminEmail,
      adminPassword: config.pocketbase.adminPassword,
    });
  }

  protected mapRecord(record: Record<string, unknown>): VideoProject {
    return {
      id: record.id as string,
      name: record.name as string,
      description: (record.description as string) || '',
      status: record.status as VideoProject['status'],
      settings: (record.settings as VideoProject['settings']) || { aspectRatio: '9:16' },
      userId: record.user_id as string,
      isActive: record.isActive as boolean,
      isDeleted: (record.isDeleted as boolean) || false,
      created: record.created as string,
      updated: record.updated as string,
    };
  }
}

export const videoProjectService = new VideoProjectService();
