/**
 * Maintenance Mode Middleware
 * 
 * Blocks non-admin access when maintenance mode is enabled.
 */
import { Request, Response, NextFunction } from 'express';
import { SettingsService } from '../services/settings.service.js';
import { createLogger } from '../utils/index.js';

const log = createLogger('MaintenanceMiddleware');
const MAINTENANCE_MODE_KEY = 'system_maintenance';

export const checkMaintenanceMode = async (req: Request, res: Response, next: NextFunction) => {
  // Allow admin users
  const user = req.user;
  if (user) {
    const hasAdminRole = user.roles?.some((r: string) => r === 'admin' || r === 'SUPER_ADMIN');
    const hasAllManage = user.permissions['all']?.includes('manage');

    if (hasAdminRole || hasAllManage) {
      next();
      return;
    }
  }

  // Allow auth routes so admins can login
  if (req.path.startsWith('/api/auth')) {
    next();
    return;
  }

  try {
    const isMaintenance = await SettingsService.getSetting<boolean>(MAINTENANCE_MODE_KEY);
    
    if (isMaintenance) {
      res.status(503).json({
        success: false,
        message: 'System is under maintenance. Please try again later.',
        code: 'MAINTENANCE_MODE'
      });
      return;
    }

    next();
  } catch (error) {
    // Fail open if settings check fails
    log.error('Failed to check maintenance mode', error);
    next();
  }
};
