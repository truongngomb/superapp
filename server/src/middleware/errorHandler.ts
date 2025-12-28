import type { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/index.js';

interface ErrorWithStatus extends Error {
  status?: number;
  statusCode?: number;
}

/**
 * Global error handler middleware
 */
export function errorHandler(
  err: ErrorWithStatus,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  const status = err.status ?? err.statusCode ?? 500;
  const message = err.message || 'Internal Server Error';

  logger.error('GlobalError', `${status}: ${message}`);
  if (process.env['NODE_ENV'] !== 'production') {
    logger.error('GlobalError', 'Stack:', err.stack);
  }

  res.status(status).json({
    success: false,
    message,
    ...(process.env['NODE_ENV'] !== 'production' && { stack: err.stack }),
  });
}

/**
 * Async handler wrapper to catch errors
 */
export function asyncHandler<T>(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<T>
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * Not found error
 */
export class NotFoundError extends Error {
  status = 404;

  constructor(message = 'Resource not found') {
    super(message);
    this.name = 'NotFoundError';
  }
}

/**
 * Validation error
 */
export class ValidationError extends Error {
  status = 400;

  constructor(message = 'Validation failed') {
    super(message);
    this.name = 'ValidationError';
  }
}
