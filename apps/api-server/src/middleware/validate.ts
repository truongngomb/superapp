/**
 * Request Validation Middleware
 * 
 * Provides validation utilities for request handling.
 * Entity schemas are in the `schemas/` directory.
 */
import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { ValidationError } from './errorHandler.js';

// Re-export schemas for backward compatibility
export { schemas, CategorySchemas, RoleSchemas } from '../schemas/index.js';

// =============================================================================
// Zod-based Validation Middleware
// =============================================================================

/**
 * Validate request body against a Zod schema
 * 
 * @example
 * ```typescript
 * import { CategoryCreateSchema } from '../schemas/index.js';
 * 
 * router.post('/categories', validateBody(CategoryCreateSchema), createCategory);
 * ```
 */
export function validateBody<T>(schema: ZodSchema<T>) {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = formatZodErrors(error);
        next(new ValidationError('Validation failed', errors));
      } else {
        next(error);
      }
    }
  };
}

/**
 * Validate request query parameters against a Zod schema
 */
export function validateQuery<T>(schema: ZodSchema<T>) {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      req.query = schema.parse(req.query) as typeof req.query;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = formatZodErrors(error);
        next(new ValidationError('Invalid query parameters', errors));
      } else {
        next(error);
      }
    }
  };
}

/**
 * Validate request params against a Zod schema
 */
export function validateParams<T>(schema: ZodSchema<T>) {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      req.params = schema.parse(req.params) as typeof req.params;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = formatZodErrors(error);
        next(new ValidationError('Invalid path parameters', errors));
      } else {
        next(error);
      }
    }
  };
}

/**
 * Format Zod errors into a field -> message mapping
 */
function formatZodErrors(error: ZodError): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const issue of error.issues) {
    const path = issue.path.join('.');
    errors[path] = issue.message;
  }
  return errors;
}

// =============================================================================
// Legacy Validation (for backward compatibility)
// =============================================================================

type ValidationFn = (body: unknown) => string | null;

/**
 * Generic validation middleware with custom validation function
 * @deprecated Use validateBody with Zod schema instead
 */
export const validate = (validateFn: ValidationFn) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    const error = validateFn(req.body);
    if (error) {
      next(new ValidationError(error));
    } else {
      next();
    }
  };
};

/**
 * @deprecated Use Zod schemas instead
 */
export const validators = {
  required: (field: string) => (body: Record<string, unknown>) => {
    const value = body[field];
    if (value === undefined || value === null || 
        (typeof value === 'string' && value.trim() === '')) {
      return `${field} is required`;
    }
    return null;
  },
};
