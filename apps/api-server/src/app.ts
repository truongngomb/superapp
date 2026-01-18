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
import { authenticate, checkMaintenanceMode, errorHandler, NotFoundError, requireAdmin } from './middleware/index.js';
import { authRouter, categoriesRouter, rolesRouter, usersRouter, activityLogsRouter, realtimeRouter, systemRouter, settingsRouter, markdownRouter } from './routes/index.js';

import { generateOpenApiDocument } from './docs/index.js';

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
  
  // Helmet with relaxed CSP for API docs
  // Helmet with CSP configuration
  // Note: 'unsafe-inline' is currently kept for compatibility with certain inline styles/scripts
  // We removed 'unsafe-eval' to improve security
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com", "https://cdn.jsdelivr.net"],
        imgSrc: ["'self'", "data:", "https:", "blob:"],
        connectSrc: ["'self'", "https:"],
      },
    },
  }));
  app.use(cors({
    origin: (origin, callback) => {
      const allowedOrigins = [
        config.clientUrl,
        config.clientUrl.replace('localhost', '127.0.0.1'),
        ...config.allowedOrigins,
      ];
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  }));

  // =========================================================================
  // Body Parsing & Compression
  // =========================================================================
  
  app.use(compression({
    filter: (req, res) => {
      if (req.headers['accept'] === 'text/event-stream') {
        return false;
      }
      return compression.filter(req, res);
    }
  }));
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  // =========================================================================
  // Authentication (populates req.user on all routes)
  // =========================================================================
  
  app.use(authenticate);
  app.use(checkMaintenanceMode);

  // =========================================================================
  // API Routes
  // =========================================================================
  
  app.use('/api/auth', authRouter);
  app.use('/api/categories', categoriesRouter);
  app.use('/api/roles', rolesRouter);
  app.use('/api/users', usersRouter);
  app.use('/api/activity-logs', activityLogsRouter);
  app.use('/api/realtime', realtimeRouter);
  app.use('/api/system', systemRouter);
  app.use('/api/settings', settingsRouter);
  app.use('/api/markdown-pages', markdownRouter);


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
  // API Documentation (Admin Only)
  // =========================================================================

  // Generate OpenAPI document
  const openApiDocument = generateOpenApiDocument(config.serverUrl) as unknown as Record<string, unknown>;

  // Serve raw OpenAPI JSON (protected - for Scalar UI on Frontend)
  app.get('/api/openapi.json', requireAdmin, (_req, res) => {
    res.json(openApiDocument);
  });

  // =========================================================================
  // Error Handling
  // =========================================================================
  
  // 404 handler for API routes
  app.use('/api/{*path}', (_req, _res, next) => {
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
