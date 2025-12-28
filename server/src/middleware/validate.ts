import { Request, Response, NextFunction } from 'express';
import { ValidationError } from './errorHandler.js';

type ValidationFn = (body: any) => string | null;

/**
 * Generic validation middleware
 * @param validateFn Function that returns error message string if invalid, null if valid
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

// Common validators
export const validators = {
  required: (field: string) => (body: any) => {
    if (!body || !body[field] || (typeof body[field] === 'string' && body[field].trim() === '')) {
      return `${field} is required`;
    }
    return null;
  }
};
