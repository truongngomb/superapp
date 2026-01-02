import { Response } from 'express';
import PocketBase from 'pocketbase';
import { config, Collections } from '../config/index.js';
import { createLogger } from '../utils/index.js';
import { ActivityLogService } from './activity_log.service.js';

const log = createLogger('RealtimeService');

interface SSEClient {
  id: string;
  res: Response;
}

/**
 * Extension of Express Response to include flush method from compression middleware
 */
export interface SSECompatibleResponse extends Omit<Response, 'flush'> {
  flush?: () => void;
}

class RealtimeService {
  private clients: SSEClient[] = [];
  private isSubscribed = false;
  private isInitializing = false;
  private pbAdmin: PocketBase | null = null;

  /**
   * Add a new SSE client
   */
  addClient(id: string, res: Response) {
    const client = { id, res };
    this.clients.push(client);
    log.info(`New SSE client connected: ${id}. Total clients: ${String(this.clients.length)}`);

    // Initial heartbeat/connection info
    this.sendToClient(client, { type: 'connected', timestamp: new Date().toISOString() });

    // Start PB subscription if not already active
    void this.initSubscription();
  }

  /**
   * Remove an SSE client
   */
  removeClient(id: string) {
    this.clients = this.clients.filter(c => c.id !== id);
    log.info(`SSE client disconnected: ${id}. Total clients: ${String(this.clients.length)}`);
  }

  /**
   * Initialize PocketBase real-time subscription using Admin credentials
   */
  private async initSubscription() {
    if (this.isSubscribed || this.isInitializing) return;
    this.isInitializing = true;

    try {
      if (!this.pbAdmin) {
        this.pbAdmin = new PocketBase(config.pocketbaseUrl);
        this.pbAdmin.autoCancellation(false);
      }

      // Authenticate as Admin if credentials provided
      if (config.pocketbaseAdminEmail && config.pocketbaseAdminPassword) {
        log.info('Authenticating RealtimeService as Admin (PB 0.22+)...');
        await this.pbAdmin.collection('_superusers').authWithPassword(
          config.pocketbaseAdminEmail,
          config.pocketbaseAdminPassword
        );
      } else {
        log.warn('No PocketBase Admin credentials found. Real-time subscription might fail due to collection rules.');
      }

      log.info(`Subscribing to PocketBase collection: ${Collections.ACTIVITY_LOGS}`);
      await this.pbAdmin.collection(Collections.ACTIVITY_LOGS).subscribe('*', (e) => {
        void (async () => {
          if (e.action === 'create') {
            try {
              if (!this.pbAdmin) return;
            // Fetch full record with expanded user relation
            const fullRecord = await this.pbAdmin.collection(Collections.ACTIVITY_LOGS).getOne(e.record.id, {
              expand: 'user',
            });

            // Transform using shared logic
            const transformedLog = ActivityLogService.transformRecord(fullRecord);
            this.broadcast('activity_log', transformedLog as unknown as Record<string, unknown>);
          } catch (error) {
              log.error(`Failed to fetch expanded activity log: ${e.record.id}`, error);
              // Fallback to raw record if fetch fails
              this.broadcast('activity_log', e.record);
            }
          }
        })();
      });
      this.isSubscribed = true;
    } catch (error) {
      log.error('Failed to subscribe to PocketBase real-time events:', error);
      // Retry after 5 seconds
      setTimeout(() => { void this.initSubscription(); }, 5000);
    } finally {
      this.isInitializing = false;
    }
  }

  /**
   * Broadcast a message to all clients
   */
  private broadcast(event: string, data: Record<string, unknown>) {
    const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
    this.clients.forEach(client => {
      client.res.write(message);
      // Flush if compression is used
      const sseRes = client.res as SSECompatibleResponse;
      if (sseRes.flush) {
        sseRes.flush();
      }
    });
  }

  /**
   * Send a message to a specific client
   */
  private sendToClient(client: SSEClient, data: Record<string, unknown>) {
    client.res.write(`data: ${JSON.stringify(data)}\n\n`);
    const sseRes = client.res as SSECompatibleResponse;
    if (sseRes.flush) {
      sseRes.flush();
    }
  }
}

export const realtimeService = new RealtimeService();
