import { BaseService } from './base.service.js';
import { pb, config } from '../config/index.js';
import type { BaseEntity } from '../types/index.js';

export interface ActivityLog extends BaseEntity {
  user?: string;
  action: 'create' | 'update' | 'delete' | 'login' | 'logout';
  resource: string;
  recordId?: string;
  message: string;
  details?: Record<string, unknown>;
  expand?: {
    user?: {
      name: string;
      avatar: string;
    };
  };
}

export interface ActivityLogInput {
  user?: string;
  action: 'create' | 'update' | 'delete' | 'login' | 'logout';
  resource: string;
  recordId?: string;
  message: string;
  details?: Record<string, unknown>;
}

export class ActivityLogService extends BaseService<ActivityLog> {
  protected readonly collectionName = 'activity_logs';
  protected readonly cacheKey = 'activity_logs';

  protected mapRecord(record: Record<string, unknown>): ActivityLog {
    return ActivityLogService.transformRecord(record);
  }

  /**
   * Static helper to transform avatar URL
   */
  static transformAvatar(avatar: string | undefined, collectionId: string, recordId: string): string {
    if (!avatar) return '';
    if (avatar.startsWith('http')) return avatar;
    return `${config.pocketbaseUrl}/api/files/${collectionId}/${recordId}/${avatar}`;
  }

  /**
   * Static helper to transform raw record to ActivityLog with expanded user
   */
  static transformRecord(record: Record<string, unknown>): ActivityLog {
    const log: ActivityLog = {
      id: record['id'] as string,
      user: record['user'] as string | undefined,
      action: record['action'] as ActivityLog['action'],
      resource: record['resource'] as string,
      recordId: record['recordId'] as string | undefined,
      message: record['message'] as string,
      details: record['details'] as Record<string, unknown> | undefined,
      created: record['created'] as string,
      updated: record['updated'] as string,
    };

    // Handle expanded user data
    const expand = record['expand'] as Record<string, unknown> | undefined;
    if (expand && typeof expand['user'] === 'object' && expand['user']) {
      const user = expand['user'] as Record<string, unknown>;
      const avatar = user['avatar'] as string | undefined;
      const collectionId = user['collectionId'] as string;
      const userId = user['id'] as string;

      log.expand = {
        user: {
          name: user['name'] as string,
          avatar: ActivityLogService.transformAvatar(avatar, collectionId, userId),
        }
      };
    }

    return log;
  }

  /**
   * Get paginated activity logs with expanded user details
   */
  async getPage(options: import('./base.service.js').ListOptions = {}): Promise<import('./base.service.js').PaginatedResult<ActivityLog>> {
    return super.getPage({
      ...options,
      expand: 'user',
    });
  }

  /**
   * Log an activity to the database
   */
  async createLog(data: ActivityLogInput): Promise<void> {
    try {
      await pb.collection(this.collectionName).create(data);
      this.log.info(`Activity logged: ${data.action} on ${data.resource}`, {
        userId: data.user,
        recordId: data.recordId
      });
    } catch (error) {
      this.log.error('Failed to create activity log:', error);
    }
  }

  /**
   * Convenience method for CRUD logging
   */
  async logCRUD(
    userId: string | undefined,
    action: 'create' | 'update' | 'delete',
    resource: string,
    recordId: string,
    details?: Record<string, unknown>
  ): Promise<void> {
    const actionPast = action === 'create' ? 'created' : action === 'update' ? 'updated' : 'deleted';
    const message = `User ${actionPast} a item in ${resource}`;
    
    await this.createLog({
      user: userId,
      action,
      resource,
      recordId,
      message,
      details,
    });
  }
}

export const activityLogService = new ActivityLogService();


