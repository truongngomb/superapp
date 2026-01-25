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
import { 
  authenticate, 
  errorHandler, 
  requestStartTracker, 
  requestEndTracker, 
  NotFoundError 
} from './middleware/index.js';

import { apiRouter } from './routes/index.js';
import { generateOpenApiDocument } from './docs/index.js';

// =============================================================================
// App Factory
// =============================================================================

/**
 * Create and configure Express application
 */
export function createApp(): Express {
  const app = express();

  // =========================================================================
  // Security Middleware
  // =========================================================================
  
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "https://cdn.jsdelivr.net"],
        styleSrc: ["'self'", "https://cdn.jsdelivr.net", "https://fonts.googleapis.com"],
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
  // Request Tracking - Start
  // =========================================================================
  
  app.use(requestStartTracker);

  // =========================================================================
  // Authentication (populates req.user on all routes)
  // =========================================================================
  
  app.use(authenticate);

  // =========================================================================
  // Request Tracking - End
  // =========================================================================
  
  app.use(requestEndTracker);

  // =========================================================================
  // API Routes
  // =========================================================================
  
  // Use /api as base prefix
  app.use('/api', apiRouter);

  // =========================================================================
  // API Documentation
  // =========================================================================

  // Generate OpenAPI document
  const openApiDocument = generateOpenApiDocument(config.serverUrl) as unknown as Record<string, unknown>;

  // Serve raw OpenAPI JSON
  app.get('/api/openapi.json', (_req, res) => {
    res.json(openApiDocument);
  });

  // =========================================================================
  // Health Check
  // =========================================================================

  app.get('/api/health', (_req, res) => {
    res.json({
      success: true,
      data: {
        status: 'ok',
        service: 'story-weaver-api',
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
