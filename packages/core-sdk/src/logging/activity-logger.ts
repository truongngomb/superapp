import PocketBase from 'pocketbase';

export interface ActivityLog {
  userId: string;
  action: string;
  resource: string;
  resourceId: string;
  metadata?: Record<string, unknown>;
}

/**
 * Activity logger for tracking user actions
 * Can be used standalone or as part of BaseService
 */
export class ActivityLogger {
  private pb: PocketBase;

  constructor(
    pocketbaseUrl: string,
    adminEmail: string,
    adminPassword: string
  ) {
    this.pb = new PocketBase(pocketbaseUrl);
    this.authenticate(adminEmail, adminPassword);
  }

  private async authenticate(email: string, password: string) {
    try {
      await this.pb.collection('_superusers').authWithPassword(email, password);
    } catch (error) {
      console.error('ActivityLogger auth failed:', error);
    }
  }

  /**
   * Log an activity
   */
  async log(log: ActivityLog): Promise<void> {
    try {
      await this.pb.collection('activity_logs').create({
        user_id: log.userId,
        action: log.action,
        resource: log.resource,
        resource_id: log.resourceId,
        metadata: log.metadata || {},
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Failed to log activity:', error);
    }
  }
}
