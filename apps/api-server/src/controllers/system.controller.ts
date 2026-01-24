import type { Request, Response } from 'express';
import si from 'systeminformation';
import { logger } from '../utils/logger.js';
import { requestMetricsService } from '../services/requestMetrics.service.js';
import { adminPb, cache } from '../config/index.js';
import { CollectionNames } from '../database/collections/index.js';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

// Track active background updates to prevent duplicate fetches
const activeUpdates = new Map<string, Promise<unknown>>();

/**
 * Generic Stale-While-Revalidate (SWR) Cache Helper
 * 
 * Strategy:
 * 1. If no cache -> Wait for fetch (Cold start overhead only)
 * 2. If valid cache -> Return immediately
 * 3. If stale cache (expired TTL) -> Return stale data immediately + Trigger background fetch
 */
async function getOrUpdateCached<T>(
  key: string,
  fetchFn: () => Promise<T>,
  ttlMs: number
): Promise<T> {
  const cached = cache.get<CacheEntry<T>>(key);
  const now = Date.now();

  // 1. Cold Start: No cache -> Must wait
  if (!cached) {
    const data = await fetchFn();
    cache.set(key, { data, timestamp: now }, 0); // Infinite TTL in underlying cache
    return data;
  }

  // 2. Check Stale
  if (now - cached.timestamp > ttlMs) {
    // Only trigger update if not already running
    if (!activeUpdates.has(key)) {
      const updatePromise = fetchFn()
        .then((data) => {
          cache.set(key, { data, timestamp: Date.now() }, 0);
        })
        .catch((err: unknown) => {
           logger.error('System', `Background update failed for ${key}`, err);
        })
        .finally(() => {
          activeUpdates.delete(key);
        });
      
      activeUpdates.set(key, updatePromise);
    }
  }

  // 3. Return (Fresh or Stale)
  return cached.data;
}

// Helper: Get Static Data (OS, CPU Hardware) - Cache: 24h
async function getStaticSystemData() {
  return getOrUpdateCached(
    'sys_static_v2', 
    async () => {
      const [cpu, os] = await Promise.all([si.cpu(), si.osInfo()]);
      return { cpu, os };
    },
    24 * 60 * 60 * 1000
  );
}

// Helper: Get Disk Data - Cache: 15m (Slow operation)
async function getDiskSystemData() {
  return getOrUpdateCached(
    'sys_disk_v2',
    async () => si.fsSize(),
    15 * 60 * 1000
  );
}

// Helper: Get Live Data (Load, Mem) - Cache: 3s (SWR makes this instant)
async function getLiveSystemData() {
  return getOrUpdateCached(
    'sys_live_v2',
    async () => {
      const [currentLoad, processLoad, mem] = await Promise.all([
        si.currentLoad(),
        si.processLoad(process.pid.toString()),
        si.mem(),
      ]);
      return { currentLoad, processLoad, mem };
    },
    3000
  );
}

export const getSystemStats = async (_req: Request, res: Response) => {
  try {
    // These calls now return "instantly" from cache (stale or fresh)
    // Only the very first call after server restart will wait.
    const [staticData, diskData, liveData] = await Promise.all([
      getStaticSystemData(),
      getDiskSystemData(),
      getLiveSystemData(),
    ]);

    // Compose Response
    const { cpu, os } = staticData;
    const disk = diskData;
    const { currentLoad, processLoad, mem } = liveData;

    const stats = {
      cpu: {
        manufacturer: cpu.manufacturer,
        brand: cpu.brand,
        speed: cpu.speed,
        cores: cpu.cores,
        physicalCores: cpu.physicalCores,
        usage: {
          system: currentLoad.currentLoad,
          server: processLoad[0]?.cpu ?? 0,
        },
      },
      memory: {
        total: mem.total,
        free: mem.free,
        used: mem.used,
        active: mem.active,
        available: mem.available,
        serverUsed: process.memoryUsage().rss,
      },
      disk: disk.map((d) => ({
        fs: d.fs,
        type: d.type,
        size: d.size,
        used: d.used,
        available: d.available,
        mount: d.mount,
        use: d.use,
      })),
      os: {
        platform: os.platform,
        distro: os.distro,
        release: os.release,
        hostname: os.hostname,
        arch: os.arch,
      },
    };

    res.json(stats);
  } catch (error) {
    logger.error('System', 'Failed to fetch system stats', error);
    res.status(500).json({ message: 'Failed to fetch system stats' });
  }
};

export const getHistory = async (req: Request, res: Response) => {
  try {
    const limit = Number(req.query.limit) || 50;
    
    // Fetch last N snapshots
    const result = await adminPb.collection(CollectionNames.SYSTEM_METRICS_SNAPSHOTS).getList(1, limit, {
      sort: '-timestamp',
    });

    // Reverse to chronological order for charts
    const history = result.items.reverse();

    res.json(history);
  } catch (error) {
    logger.error('System', 'Failed to fetch system history', error);
    res.status(500).json({ message: 'Failed to fetch system history' });
  }
};

export const getRequestMetrics = async (_req: Request, res: Response) => {
  try {
    const metrics = requestMetricsService.getMetrics();
    // Await promise to satisfy linter rule for async function
    await Promise.resolve();
    res.json(metrics);
  } catch (error) {
    logger.error('System', 'Failed to fetch request metrics', error);
    res.status(500).json({ message: 'Failed to fetch request metrics' });
  }
};

export const pruneLogs = async (req: Request, res: Response) => {
  try {
    const { days } = req.body as { days: unknown };
    if (!days || (typeof days !== 'number')) {
      return res.status(400).json({ message: 'Invalid days parameter' });
    }

    // Dynamic import to avoid circular dependency issues if any
    const { activityLogService } = await import('../services/activity_log.service.js');
    await activityLogService.pruneOldLogs(days);

    res.json({ success: true, message: `Logs older than ${String(days)} days pruned` });
  } catch (error) {
    logger.error('System', 'Failed to prune logs', error);
    res.status(500).json({ message: 'Failed to prune logs' });
  }
};

export const clearCache = async (_req: Request, res: Response) => {
  try {
    cache.flushAll();
    logger.info('System', 'System cache cleared by admin');
    // Await promise to satisfy linter rule for async function
    await Promise.resolve();
    res.json({ success: true, message: 'System cache cleared successfully' });
  } catch (error) {
    logger.error('System', 'Failed to clear cache', error);
    res.status(500).json({ message: 'Failed to clear cache' });
  }
};

export const getBackups = async (_req: Request, res: Response) => {
  try {
    const { backupService } = await import('../services/backup.service.js');
    const backups = await backupService.list();
    res.json(backups);
  } catch (error) {
    logger.error('System', 'Failed to list backups', error);
    res.status(500).json({ message: 'Failed to list backups' });
  }
};

export const createBackup = async (_req: Request, res: Response) => {
  try {
    const { backupService } = await import('../services/backup.service.js');
    await backupService.create();
    res.json({ success: true, message: 'Backup created successfully' });
  } catch (error) {
    logger.error('System', 'Failed to create backup', error);
    res.status(500).json({ message: 'Failed to create backup' });
  }
};

export const restoreBackup = async (req: Request, res: Response) => {
  try {
    const { key } = req.params as { key: string };
    if (!key) {
      return res.status(400).json({ message: 'Backup key is required' });
    }
    
    // Safety check? User must confirm on frontend.
    const { backupService } = await import('../services/backup.service.js');
    await backupService.restore(key);
    
    // Note: Restore usually restarts the server or requires reload.
    res.json({ success: true, message: 'System restored successfully' });
  } catch (error) {
    logger.error('System', 'Failed to restore backup', error);
    res.status(500).json({ message: 'Failed to restore backup' });
  }
};

export const deleteBackup = async (req: Request, res: Response) => {
  try {
    const { key } = req.params as { key: string };
    if (!key) {
      return res.status(400).json({ message: 'Backup key is required' });
    }
    
    const { backupService } = await import('../services/backup.service.js');
    await backupService.delete(key);
    res.json({ success: true, message: 'Backup deleted successfully' });
  } catch (error) {
    logger.error('System', 'Failed to delete backup', error);
    res.status(500).json({ message: 'Failed to delete backup' });
  }
};
