import type { Request, Response } from 'express';
import si, { Systeminformation } from 'systeminformation';
import { logger } from '../utils/logger.js';

import { cache } from '../config/index.js';

export const getSystemStats = async (_req: Request, res: Response) => {
  try {
    // 1. Static Data (TTL: 24h) - OS & CPU Hardware
    let staticData = cache.get<{ cpu: Systeminformation.CpuData; os: Systeminformation.OsData }>('sys_static');
    if (!staticData) {
      const [cpu, os] = await Promise.all([
        si.cpu(),
        si.osInfo(),
      ]);
      staticData = { cpu, os };
      cache.set('sys_static', staticData, 60 * 60 * 24);
    }

    // 2. Disk Data (TTL: 5m) - Slowest operation
    let diskData = cache.get<Systeminformation.FsSizeData[]>('sys_disk');
    if (!diskData) {
      diskData = await si.fsSize();
      cache.set('sys_disk', diskData, 60 * 5);
    }

    // 3. Live Data (TTL: 5s) - CPU Load & Memory
    let liveData = cache.get<{ 
      currentLoad: Systeminformation.CurrentLoadData; 
      processLoad: Systeminformation.ProcessesProcessLoadData[]; 
      mem: Systeminformation.MemData 
    }>('sys_live');
    
    if (!liveData) {
      const [currentLoad, processLoad, mem] = await Promise.all([
        si.currentLoad(),
        si.processLoad(process.pid.toString()),
        si.mem(),
      ]);
      liveData = { currentLoad, processLoad, mem };
      cache.set('sys_live', liveData, 5);
    }

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
    const { key } = req.params;
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
    const { key } = req.params;
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
