import { Request, Response, NextFunction } from 'express';
import { Resource, Action } from '../types/index.js';
import { logger } from '../utils/index.js';

/**
 * Middleware factory to check for specific permissions
 */
export const requirePermission = (resource: Resource, action: Action) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;

    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Unauthorized access. Please login.' 
      });
    }

    const permissions = user.permissions || {};
    
    // Debug logging for permissions
    if (process.env.NODE_ENV !== 'production') {
      logger.debug('RBAC', `Checking permission for user ${user.id}`, { 
        required: { resource, action }, 
        userPermissions: permissions 
      });
    }

    // Check permissions
    // 1. Check exact resource + action
    const resourceActions = permissions[resource] || [];
    const hasExactPermission = resourceActions.includes(action);
    const hasResourceManage = resourceActions.includes('manage');

    // 2. Check 'all' resource (Super Admin)
    const allActions = Array.isArray(permissions['all']) ? permissions['all'] : [];
    const hasGlobalManage = allActions.includes('manage');
    
    // Debug result of checks
    if (!hasExactPermission && !hasResourceManage && !hasGlobalManage) {
       if (process.env.NODE_ENV !== 'production') {
         logger.debug('RBAC', 'Permission Check Failed', {
           resource,
           action,
           hasExactPermission,
           hasResourceManage,
           hasGlobalManage,
           allActionsType: typeof permissions['all'],
           allActionsValue: permissions['all']
         });
       }
    }

    if (hasExactPermission || hasResourceManage || hasGlobalManage) {
      return next();
    }

    return res.status(403).json({ 
      success: false, 
      message: `Forbidden. You do not have permission to ${action} ${resource}.` 
    });
  };
};
