/**
 * Middleware Module - Central Middleware Exports
 * 
 * Re-exports all middleware from individual modules.
 * Import from here for cleaner imports throughout the app.
 */

// Error handling
export {
  // Base class
  HttpError,
  // Client errors (4xx)
  BadRequestError,
  ValidationError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  UnprocessableEntityError,
  TooManyRequestsError,
  // Server errors (5xx)
  InternalServerError,
  ServiceUnavailableError,
  // Handler & utilities
  errorHandler,
  asyncHandler,
} from './errorHandler.js';

// Authentication
export * from './auth.js';
export * from './maintenance.js';

// RBAC
export {
  requirePermission,
  requireAnyPermission,
  requireAllPermissions,
  hasPermission,
} from './rbac.js';

// Validation
export {
  // Zod-based validation
  validateBody,
  validateQuery,
  validateParams,
  // Common schemas
  schemas,
  CategorySchemas,
  RoleSchemas,
  // Legacy (deprecated)
  validate,
  validators,
} from './validate.js';

// Rate Limiting
export {
  rateLimit,
  batchOperationLimit,
  standardRateLimit,
} from './rateLimit.js';
