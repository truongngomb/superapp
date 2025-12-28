import { Request, Response, NextFunction } from 'express';
import { pb } from '../config/database.js';
import { getUserPermissions } from '../services/permissionService.js';
import { AuthUser } from '../types/index.js';
import { logger } from '../utils/index.js';



declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

const COOKIE_NAME = 'pb_auth';

/**
 * Middleware to check authentication status and load permissions
 * Does not block the request, just populates req.user
 * Optimized: Cookie now only contains token (not full user model)
 */
export const authenticate = async (req: Request, _res: Response, next: NextFunction) => {
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
      permissions
    };
  } catch (error) {
    // Invalid token or expired
    logger.warn('AuthMiddleware', 'Auth error:', error);
  }
  
  next();
};

/**
 * Middleware to require authentication
 * Blocks request if not authenticated
 */
export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ 
      success: false, 
      message: 'Unauthorized access. Please login.' 
    });
  }
  next();
};
