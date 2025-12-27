import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import { categoriesRouter } from './routes/categories.js';
import { authRouter } from './routes/auth.js';
import { errorHandler } from './middleware/errorHandler.js';
import { cache } from './config/cache.js';
import { config } from './config/env.js';

const app = express();

// Security middleware - Helmet adds various HTTP headers for security
app.use(helmet({
  contentSecurityPolicy: config.nodeEnv === 'production',
  crossOriginEmbedderPolicy: false,
}));

// CORS configuration
app.use(cors({
  origin: [config.clientUrl],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

// Cookie parser middleware
app.use(cookieParser());

// Compression middleware for better performance
app.use(compression());

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    cacheStats: cache.getStats(),
  });
});

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/categories', categoriesRouter);

// 404 handler
app.use('/api/*', (_req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found',
  });
});

// Global error handler
app.use(errorHandler);

// Start server
app.listen(config.port, () => {
  console.log(`
🚀 SuperApp Server is running!
📍 Environment: ${config.nodeEnv}
🌐 URL: http://localhost:${config.port}
📚 API: http://localhost:${config.port}/api
❤️  Health: http://localhost:${config.port}/api/health
  `);
});

export default app;
