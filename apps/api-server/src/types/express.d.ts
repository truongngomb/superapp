/**
 * Express Middleware Types
 * 
 * Augment the Express Request interface with our custom AuthUser type.
 */
import { AuthUser } from '@superapp/shared-types';

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export {};
