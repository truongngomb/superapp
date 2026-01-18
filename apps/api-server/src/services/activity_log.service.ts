import { BaseService } from './base.service.js';
import { Collections, CacheKeys, config } from '../config/index.js';
import type { ActivityLog, ActivityLogInput } from '@superapp/shared-types';

// Re-export types for backwards compatibility
export type { ActivityLog, ActivityLogInput };

export class ActivityLogService extends BaseService<ActivityLog> {
  protected readonly collectionName = Collections.ACTIVITY_LOGS;
  protected readonly cacheKey = CacheKeys.ACTIVITY_LOGS;
  protected readonly defaultExpand = 'user';

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

  // getPage() is inherited from BaseService with defaultExpand = 'user'

  /**
   * Sanitize log details to remove sensitive information
   * Uses case-insensitive matching and keyword detection
   */
  private sanitizeDetails(details?: Record<string, unknown>): Record<string, unknown> | undefined {
    if (!details) return undefined;

    // Keywords that should trigger redaction if the field name contains them (case-insensitive)
    const sensitiveKeywords = ['password', 'token', 'secret', 'credential', 'auth', 'cookie', 'session'];
    // Exact field names that should be redacted
    const sensitiveFields = ['state', 'codeVerifier', 'apiKey', 'key'];

    const sanitized = JSON.parse(JSON.stringify(details)) as Record<string, unknown>;

    const walk = (obj: Record<string, unknown>) => {
      for (const key in obj) {
        const lowerKey = key.toLowerCase();
        const isSensitive = 
          sensitiveFields.some(f => f.toLowerCase() === lowerKey) ||
          sensitiveKeywords.some(kw => lowerKey.includes(kw));

        if (isSensitive) {
          obj[key] = '[REDACTED]';
        } else if (typeof obj[key] === 'object' && obj[key] !== null) {
          walk(obj[key] as Record<string, unknown>);
        }
      }
    };

    walk(sanitized);
    return sanitized;
  }

  /**
   * Log an activity to the database (uses BaseService.create with skipLog=true)
   */
  async createLog(data: ActivityLogInput): Promise<void> {
    try {
      const sanitizedData = {
        ...data,
        details: this.sanitizeDetails(data.details),
      };
      await this.create(sanitizedData as Partial<Omit<ActivityLog, 'id' | 'created'>>, undefined, true);
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
  /**
   * Delete logs older than specific days
   * @param days Number of days to keep
   * @returns Number of deleted logs (approximate, as PocketBase doesn't return count on delete)
   */
  async pruneOldLogs(days: number): Promise<void> {
    const date = new Date();
    date.setDate(date.getDate() - days);
    const filterDate = date.toISOString().replace('T', ' '); // Format: "2023-01-01 00:00:00.000Z"

    // PocketBase SDK doesn't support bulk delete by filter directly in one call typically
    // We fetch IDs first then delete them in batch (or loop if batch not supported well)
    // However, for simplicity and performance on small scale, we iterate.
    // Optimal way for PB: Use batch delete if available or loop.
    
    try {
      // 1. Fetch old logs
      const records = await this.db.collection(this.collectionName).getFullList({
        filter: `created < "${filterDate}"`,
        fields: 'id',
      });

      if (records.length === 0) return;

      // 2. Delete iteratively (SDK batch support varies)
      // Note: For massive amounts of logs, consider a backend command or raw SQL if possible.
      // Here we use a safe concurrent-limit approach via Promise.all if supported,
      // but simple loop is safer for stability on some PB versions/limits.
      
      for (const record of records) {
         try {
           await this.db.collection(this.collectionName).delete(record.id);
         } catch {
           // Ignore individual delete failures to proceed
         }
      }
      
      this.log.info(`Pruned ${String(records.length)} logs older than ${String(days)} days`);
    } catch (error) {
      this.log.error('Failed to prune logs:', error as Error);
      throw error;
    }
  }
}

export const activityLogService = new ActivityLogService();


