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
 */
export const authenticate = async (req: Request, _res: Response, next: NextFunction) => {
  const authCookie = req.cookies[COOKIE_NAME];
  
  if (!authCookie) {
    return next();
  }

  try {
    const { token, model } = JSON.parse(authCookie);
    
    // Basic structural check
    if (!token || !model) {
      return next();
    }

    // In a real high-throughput scenario, we might trust the cookie for a short time
    // OR verify with PB. For RBAC, we need fresh permissions.
    if (pb.authStore.isValid) {
      // Async fetch permissions
      const permissions = await getUserPermissions(model.id);

      req.user = {
        id: model.id,
        email: model.email,
        role: model.role, // We might need to ensure 'role' is in the model
        permissions
      };
    }
  } catch (error) {
    // Invalid token or JSON
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
