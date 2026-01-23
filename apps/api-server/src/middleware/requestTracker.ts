import type { Request, Response, NextFunction } from 'express';
import { requestMetricsService } from '../services/requestMetrics.service.js';

/**
 * Request Tracker Middleware
 * 
 * Tracks HTTP request metadata and performance metrics.
 * Records request duration, status code, method, and path.
 */

// Extend Express Request interface
interface RequestWithStartTime extends Request {
  startTime?: number;
}

/**
 * Paths to exclude from tracking (health checks, static assets)
 */
const EXCLUDED_PATHS = [
  '/health',
  '/ping',
  '/favicon.ico',
  '/_next',
  '/static'
];

/**
 * Check if path should be excluded from tracking
*/
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
 * Records request metrics when response is finished
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
    
    // Record the metric
    requestMetricsService.recordRequest({
      timestamp: reqWithStartTime.startTime || Date.now(),
      method: req.method,
      path: req.originalUrl,
      statusCode: res.statusCode,
      duration,
      userAgent: req.get('user-agent'),
      ip: req.ip || req.socket.remoteAddress
    });
  });

  next();
}
