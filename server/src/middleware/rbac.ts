/**
 * Role-Based Access Control (RBAC) Middleware
 * 
 * Provides permission-based access control for routes.
 */
import { Request, Response, NextFunction } from 'express';
import { Resource, Action } from '../types/index.js';
import { config } from '../config/index.js';
import { UnauthorizedError, ForbiddenError } from './errorHandler.js';
import { logger } from '../utils/index.js';

// =============================================================================
// Permission Check Middleware
// =============================================================================

/**
 * Require specific permission middleware factory
 * 
 * Checks if the authenticated user has the required permission.
 * Permission is granted if:
 * 1. User has exact permission (resource + action)
 * 2. User has 'manage' permission on the resource
 * 3. User has 'manage' permission on 'all' resources (Super Admin)
 * 
 * @param resource - The resource to check permission for
 * @param action - The action to check permission for
 * 
 * @throws UnauthorizedError if not authenticated
 * @throws ForbiddenError if lacking permission
 * 
 * @example
 * ```typescript
 * router.post('/categories', requirePermission('categories', 'create'), createCategory);
 * ```
 */
export const requirePermission = (resource: Resource, action: Action) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    const user = req.user;

    // Check authentication
    if (!user) {
      throw new UnauthorizedError('Please login to access this resource');
    }

    const permissions = user.permissions || {};

    // Debug logging in development
    if (config.isDevelopment) {
      logger.debug('RBAC', `Checking permission for user ${user.id}`, {
        required: { resource, action },
        userPermissions: permissions,
      });
    }

    // Check permissions
    const hasPermission = checkPermission(permissions, resource, action);

    if (!hasPermission) {
      if (config.isDevelopment) {
        logger.debug('RBAC', 'Permission denied', { resource, action, user: user.id });
      }
      throw new ForbiddenError(
        `You don't have permission to ${action} ${resource}`
      );
    }

    next();
  };
};

/**
 * Check if permissions object grants access to resource + action
 */
function checkPermission(
  permissions: Record<string, string[]>,
  resource: Resource,
  action: Action
): boolean {
  // 1. Check exact resource + action
  const resourceActions = permissions[resource] || [];
  if (resourceActions.includes(action)) {
    return true;
  }

  // 2. Check 'manage' permission on resource (grants all actions)
  if (resourceActions.includes('manage')) {
    return true;
  }

  // 3. Check 'all' resource with 'manage' (Super Admin)
  const allActions = Array.isArray(permissions['all']) ? permissions['all'] : [];
  if (allActions.includes('manage')) {
    return true;
  }

  return false;
}

// =============================================================================
// Utility Middleware
// =============================================================================

/**
 * Require any of the specified permissions
 * 
 * @example
 * ```typescript
 * router.get('/admin', requireAnyPermission([
 *   ['users', 'view'],
 *   ['roles', 'view'],
 * ]), adminDashboard);
 * ```
 */
export const requireAnyPermission = (
  permissions: Array<[Resource, Action]>
) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    const user = req.user;

    if (!user) {
      throw new UnauthorizedError('Please login to access this resource');
    }

    const userPerms = user.permissions || {};
    const hasAny = permissions.some(([resource, action]) =>
      checkPermission(userPerms, resource, action)
    );

    if (!hasAny) {
      throw new ForbiddenError('Insufficient permissions');
    }

    next();
  };
};

/**
 * Require all of the specified permissions
 * 
 * @example
 * ```typescript
 * router.delete('/system/reset', requireAllPermissions([
 *   ['users', 'delete'],
 *   ['roles', 'delete'],
 * ]), systemReset);
 * ```
 */
export const requireAllPermissions = (
  permissions: Array<[Resource, Action]>
) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    const user = req.user;

    if (!user) {
      throw new UnauthorizedError('Please login to access this resource');
    }

    const userPerms = user.permissions || {};
    const hasAll = permissions.every(([resource, action]) =>
      checkPermission(userPerms, resource, action)
    );

    if (!hasAll) {
      throw new ForbiddenError('Insufficient permissions');
    }

    next();
  };
};
