/**
 * Request Tracker Middleware
 * 
 * Tracks HTTP request performance.
 * Records request duration, status code, method, and path.
 */
import type { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger.js';

// Extend Express Request interface
interface RequestWithStartTime extends Request {
  startTime?: number;
}

/**
 * Paths to exclude from detailed tracking
 */
const EXCLUDED_PATHS = [
  '/health',
  '/api/health',
  '/ping',
  '/favicon.ico',
];

function shouldExclude(path: string): boolean {
  return EXCLUDED_PATHS.some(excluded => path.startsWith(excluded));
}

/**
 * Request start tracking middleware
 * Attaches start timestamp to request
 */
export function requestStartTracker(req: Request, _res: Response, next: NextFunction): void {
  // Skip excluded paths
  if (shouldExclude(req.path)) {
    next();
    return;
  }

  // Record start time
  (req as RequestWithStartTime).startTime = Date.now();
  
  next();
}

/**
 * Request end tracking middleware
 * Log request metrics when response is finished
 */
export function requestEndTracker(req: Request, res: Response, next: NextFunction): void {
  const reqWithStartTime = req as RequestWithStartTime;
  
  // Skip excluded paths
  if (shouldExclude(req.path)) {
    next();
    return;
  }

  // Skip if start time wasn't set
  if (!reqWithStartTime.startTime) {
    next();
    return;
  }

  // Hook into response finish event
  res.on('finish', () => {
    const duration = Date.now() - (reqWithStartTime.startTime || Date.now());
    
    // For now, just log to info.
    // In future, this can connect to requestMetricsService like in API Server
    if (res.statusCode >= 500) {
      logger.error('HttpLog', `${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`);
    } else if (res.statusCode >= 400) {
      logger.warn('HttpLog', `${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`);
    } else {
      logger.info('HttpLog', `${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`);
    }
  });

  next();
}
