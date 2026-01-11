/**
 * Rate Limiter Middleware
 * 
 * Simple in-memory rate limiting for API endpoints.
 * Does not require external dependencies.
 */
import { Request, Response, NextFunction } from 'express';
import { TooManyRequestsError } from './errorHandler.js';
import { config } from '../config/index.js';

// =============================================================================
// Types
// =============================================================================

interface RateLimitOptions {
  /** Time window in milliseconds */
  windowMs: number;
  /** Maximum number of requests per window */
  maxRequests: number;
  /** Custom message for rate limit exceeded */
  message?: string;
}

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// =============================================================================
// Rate Limiter Store
// =============================================================================

const rateLimitStore = new Map<string, RateLimitEntry>();

// Cleanup expired entries every minute
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}, 60000);

// =============================================================================
// Rate Limiter Factory
// =============================================================================

/**
 * Create a rate limiter middleware with specified options
 * 
 * @example
 * ```typescript
 * // Limit to 10 requests per minute
 * router.post('/batch-delete', rateLimit({ windowMs: 60000, maxRequests: 10 }), handler);
 * ```
 */
export function rateLimit(options: RateLimitOptions) {
  const { windowMs, maxRequests, message } = options;

  return (req: Request, _res: Response, next: NextFunction) => {
    // Use user ID if authenticated, otherwise use IP
    const identifier = req.user?.id || req.ip || 'anonymous';
    const key = `${req.path}:${identifier}`;
    const now = Date.now();

    const entry = rateLimitStore.get(key);

    if (!entry || now > entry.resetTime) {
      // Create new entry or reset expired one
      rateLimitStore.set(key, {
        count: 1,
        resetTime: now + windowMs,
      });
      next();
      return;
    }

    if (entry.count >= maxRequests) {
      throw new TooManyRequestsError(
        message || 'Too many requests, please try again later'
      );
    }

    // Increment counter
    entry.count++;
    next();
  };
}

// =============================================================================
// Pre-configured Rate Limiters
// =============================================================================

/**
 * Strict rate limiter for batch operations
 * 10 requests per minute per user
 */
export const batchOperationLimit = rateLimit({
  windowMs: config.rateLimit.windowMs,
  maxRequests: config.rateLimit.batchMax,
  message: 'Too many batch operations. Please wait a moment before trying again.',
});

/**
 * Standard rate limiter for general API endpoints
 * 100 requests per minute per user
 */
export const standardRateLimit = rateLimit({
  windowMs: config.rateLimit.windowMs,
  maxRequests: config.rateLimit.standardMax,
});
