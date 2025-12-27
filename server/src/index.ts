import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { categoriesRouter } from './routes/categories.js';
import { errorHandler } from './middleware/errorHandler.js';
import { cache } from './config/cache.js';

const PORT = process.env['PORT'] ?? 3001;
const NODE_ENV = process.env['NODE_ENV'] ?? 'development';

const app = express();

// Security middleware - Helmet adds various HTTP headers for security
app.use(helmet({
  contentSecurityPolicy: NODE_ENV === 'production',
  crossOriginEmbedderPolicy: false,
}));

// CORS configuration
app.use(cors({
  origin: NODE_ENV === 'production' 
    ? ['https://yourdomain.com'] 
    : ['http://localhost:5173', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

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
app.listen(PORT, () => {
  console.log(`
🚀 SuperApp Server is running!
📍 Environment: ${NODE_ENV}
🌐 URL: http://localhost:${PORT}
📚 API: http://localhost:${PORT}/api
❤️  Health: http://localhost:${PORT}/api/health
  `);
});

export default app;
