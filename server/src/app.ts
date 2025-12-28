/**
 * Express Application Configuration
 * 
 * Sets up middleware, routes, and error handling.
 */
import express, { type Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';

import { config, cache } from './config/index.js';
import { authenticate, errorHandler, NotFoundError } from './middleware/index.js';
import { authRouter, categoriesRouter, rolesRouter } from './routes/index.js';

// =============================================================================
// App Factory
// =============================================================================

/**
 * Create and configure Express application
 */
function createApp(): Express {
  const app = express();

  // =========================================================================
  // Security Middleware
  // =========================================================================
  
  app.use(helmet());
  app.use(cors({
    origin: config.clientUrl,
    credentials: true,
  }));

  // =========================================================================
  // Body Parsing & Compression
  // =========================================================================
  
  app.use(compression());
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  // =========================================================================
  // Authentication (populates req.user on all routes)
  // =========================================================================
  
  app.use(authenticate);

  // =========================================================================
  // API Routes
  // =========================================================================
  
  app.use('/api/auth', authRouter);
  app.use('/api/categories', categoriesRouter);
  app.use('/api/roles', rolesRouter);

  // =========================================================================
  // Health Check
  // =========================================================================
  
  app.get('/api/health', (_req, res) => {
    res.json({
      success: true,
      data: {
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: config.nodeEnv,
        cache: cache.getStats(),
      },
    });
  });

  // =========================================================================
  // Error Handling
  // =========================================================================
  
  // 404 handler for API routes
  app.use('/api/*', (_req, _res, next) => {
    next(new NotFoundError('Endpoint not found'));
  });

  // Global error handler (must be last)
  app.use(errorHandler);

  return app;
}

// =============================================================================
// Export
// =============================================================================

const app = createApp();
export default app;
