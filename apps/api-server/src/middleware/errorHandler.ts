/**
 * Error Classes & Global Error Handler
 * 
 * Provides standardized HTTP error classes and global error handling middleware.
 */
import type { Request, Response, NextFunction } from 'express';
import { config } from '../config/index.js';
import { logger } from '../utils/index.js';

// =============================================================================
// Base HTTP Error Class
// =============================================================================

/**
 * Base class for all HTTP errors
 * Extend this to create custom error types
 */
export abstract class HttpError extends Error {
  abstract readonly status: number;
  abstract readonly code: string;

  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    // Maintains proper stack trace for where error was thrown
    Error.captureStackTrace(this, this.constructor);
  }
}

// =============================================================================
// Client Errors (4xx)
// =============================================================================

/**
 * 400 Bad Request - Invalid request syntax or parameters
 */
export class BadRequestError extends HttpError {
  readonly status = 400;
  readonly code = 'BAD_REQUEST';

  constructor(message = 'Bad request') {
    super(message);
  }
}

/**
 * 400 Validation Error - Request body validation failed
 */
export class ValidationError extends HttpError {
  readonly status = 400;
  readonly code = 'VALIDATION_ERROR';
  readonly errors?: Record<string, string>;

  constructor(message = 'Validation failed', errors?: Record<string, string>) {
    super(message);
    this.errors = errors;
  }
}

/**
 * 401 Unauthorized - Authentication required
 */
export class UnauthorizedError extends HttpError {
  readonly status = 401;
  readonly code = 'UNAUTHORIZED';

  constructor(message = 'Authentication required') {
    super(message);
  }
}

/**
 * 403 Forbidden - Authenticated but lacks permission
 */
export class ForbiddenError extends HttpError {
  readonly status = 403;
  readonly code = 'FORBIDDEN';

  constructor(message = 'Access denied') {
    super(message);
  }
}

/**
 * 404 Not Found - Resource does not exist
 */
export class NotFoundError extends HttpError {
  readonly status = 404;
  readonly code = 'NOT_FOUND';

  constructor(message = 'Resource not found') {
    super(message);
  }
}

/**
 * 409 Conflict - Resource already exists or state conflict
 */
export class ConflictError extends HttpError {
  readonly status = 409;
  readonly code = 'CONFLICT';

  constructor(message = 'Resource already exists') {
    super(message);
  }
}

/**
 * 422 Unprocessable Entity - Semantic errors in request
 */
export class UnprocessableEntityError extends HttpError {
  readonly status = 422;
  readonly code = 'UNPROCESSABLE_ENTITY';

  constructor(message = 'Unprocessable entity') {
    super(message);
  }
}

/**
 * 429 Too Many Requests - Rate limit exceeded
 */
export class TooManyRequestsError extends HttpError {
  readonly status = 429;
  readonly code = 'TOO_MANY_REQUESTS';

  constructor(message = 'Too many requests, please try again later') {
    super(message);
  }
}

// =============================================================================
// Server Errors (5xx)
// =============================================================================

/**
 * 500 Internal Server Error - Unexpected server error
 */
export class InternalServerError extends HttpError {
  readonly status = 500;
  readonly code = 'INTERNAL_ERROR';

  constructor(message = 'Internal server error') {
    super(message);
  }
}

/**
 * 503 Service Unavailable - Service temporarily unavailable
 */
export class ServiceUnavailableError extends HttpError {
  readonly status = 503;
  readonly code = 'SERVICE_UNAVAILABLE';

  constructor(message = 'Service temporarily unavailable') {
    super(message);
  }
}

// =============================================================================
// Error Handler Middleware
// =============================================================================

interface ErrorWithStatus extends Error {
  status?: number;
  statusCode?: number;
  code?: string;
  errors?: Record<string, string>;
}

/**
 * Global error handler middleware
 * 
 * Catches all errors and returns standardized JSON response
 */
export function errorHandler(
  err: ErrorWithStatus,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  const status = err.status ?? err.statusCode ?? 500;
  const message = err.message || 'Internal Server Error';
  const code = err.code || 'UNKNOWN_ERROR';

  // Log error
  logger.error('GlobalError', `[${code}] ${status.toString()}: ${message}`);
  if (config.isDevelopment) {
    logger.error('GlobalError', 'Stack:', err.stack);
  }

  // Build response
  const response: Record<string, unknown> = {
    success: false,
    code,
    message,
  };

  // Include validation errors if present
  if ('errors' in err && err.errors) {
    response['errors'] = err.errors;
  }

  // Include stack in development
  if (config.isDevelopment) {
    response['stack'] = err.stack;
  }

  res.status(status).json(response);
}

// =============================================================================
// Utilities
// =============================================================================

/**
 * Async handler wrapper to catch errors in async route handlers
 * 
 * @example
 * ```typescript
 * router.get('/users', asyncHandler(async (req, res) => {
 *   const users = await userService.getAll();
 *   res.json(users);
 * }));
 * ```
 */
export function asyncHandler<T>(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<T>
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
