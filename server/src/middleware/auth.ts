/**
 * Authentication Middleware
 * 
 * Provides authentication and authorization middleware for Express routes.
 */
import { Request, Response, NextFunction } from 'express';
import { pb } from '../config/database.js';
import { getUserPermissions } from '../services/permissionService.js';
import { AuthUser } from '../types/index.js';
import { UnauthorizedError } from './errorHandler.js';
import { logger } from '../utils/index.js';

// =============================================================================
// Express Type Augmentation
// =============================================================================

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

// =============================================================================
// Constants
// =============================================================================

const COOKIE_NAME = 'pb_auth';

// =============================================================================
// Middleware
// =============================================================================

/**
 * Authentication middleware - populates req.user
 * 
 * Does not block the request if unauthenticated.
 * Use `requireAuth` to block unauthenticated requests.
 * 
 * Cookie contains only JWT token (optimized).
 */
export const authenticate = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  const token = req.cookies[COOKIE_NAME];

  if (!token || typeof token !== 'string') {
    return next();
  }

  try {
    // Load token and validate with PocketBase
    pb.authStore.save(token, null);

    if (!pb.authStore.isValid) {
      return next();
    }

    // Fetch fresh user data from PocketBase
    const authData = await pb.collection('users').authRefresh();
    const model = authData.record;

    // Fetch user permissions
    const permissions = await getUserPermissions(model.id);

    req.user = {
      id: model.id,
      email: model.email,
      role: model.role,
      permissions,
    };
  } catch (error) {
    // Invalid token or expired - silently continue
    logger.warn('AuthMiddleware', 'Auth validation failed:', error);
  }

  next();
};

/**
 * Require authentication middleware
 * 
 * Blocks request with 401 if not authenticated.
 * Use after `authenticate` middleware.
 * 
 * @throws UnauthorizedError if not authenticated
 * 
 * @example
 * ```typescript
 * router.get('/profile', requireAuth, getProfile);
 * ```
 */
export const requireAuth = (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    throw new UnauthorizedError('Please login to access this resource');
  }
  next();
};
