import type { Request, Response, NextFunction } from 'express';
import { verifyToken } from '@superapp/core-sdk/auth';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role?: unknown;
      };
    }
  }
}

/**
 * Authentication middleware using core-sdk
 */
export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const user = await verifyToken(token, {
      pocketbaseUrl: process.env.POCKETBASE_URL!,
    });

    req.user = user;
    next();
  } catch {
    res.status(401).json({ error: 'Unauthorized' });
  }
}
