import cron from 'node-cron';
import { requestMetricsService } from './requestMetrics.service.js';
import { SettingsService } from './settings.service.js';
import { SYSTEM_METRICS_SNAPSHOT_INTERVAL } from '@superapp/shared-types';
import { createLogger } from '../utils/index.js';

const log = createLogger('SchedulerService');

/**
 * Scheduler Service
 * Manages scheduled tasks (cron jobs)
 */
class SchedulerService {
  private requestSnapshotJob: cron.ScheduledTask | null = null;
  private readonly DEFAULT_INTERVAL = 30; // 30 minutes

  /**
   * Initialize all scheduled tasks
   */
  public async initialize(): Promise<void> {
    log.info('Initializing Scheduler Service...');
    
    // 1. Snapshot Request Metrics
    await this.initRequestSnapshotJob();
    
    log.info('Scheduler Service initialized.');
  }

  /**
   * Initialize Request Snapshot Job
   */
  private async initRequestSnapshotJob(): Promise<void> {
    // Get interval from settings or default
    let interval = this.DEFAULT_INTERVAL;
    
    try {
      const setting = await SettingsService.getSetting<number>(SYSTEM_METRICS_SNAPSHOT_INTERVAL);
      if (setting && typeof setting === 'number' && setting > 0) {
        interval = setting;
      }
    } catch (error) {
      log.warn(`Failed to get snapshot interval setting, using default (${String(interval)}m):`, error);
    }

    this.scheduleRequestSnapshot(interval);
  }

  /**
   * Schedule the Request Snapshot job
   */
  private scheduleRequestSnapshot(intervalMinutes: number): void {
    // Stop existing if any
    if (this.requestSnapshotJob) {
      void this.requestSnapshotJob.stop();
      this.requestSnapshotJob = null;
    }

    // Cron pattern: "*/X * * * *"
    // Handle special case where 60 minutes means hourly "0 * * * *"
    let pattern = `*/${String(intervalMinutes)} * * * *`;
    if (intervalMinutes === 60) {
        pattern = '0 * * * *';
    }

    log.info(`Scheduling Request Snapshot job with pattern: "${pattern}" (${String(intervalMinutes)}m)`);

    this.requestSnapshotJob = cron.schedule(pattern, async () => {
      log.info('Running Scheduled Job: Request History Snapshot');
      try {
        await requestMetricsService.createSnapshot();
        log.info('Snapshot created successfully.');
      } catch (error) {
        log.error('Failed to create snapshot:', error);
      }
    });
  }

  /**
   * Update interval for snapshot job
   * Called when admin changes the setting
   */
  public updateSnapshotInterval(minutes: number): void {
    if (!minutes || minutes <= 0) {
        log.warn('Invalid interval provided for update:', minutes);
        return;
    }
    
    log.info(`Updating Snapshot interval to ${String(minutes)} minutes...`);
    this.scheduleRequestSnapshot(minutes);
  }
}

export const schedulerService = new SchedulerService();
