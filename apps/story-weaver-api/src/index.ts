/**
 * Story Weaver API Server
 * Microservice for video generation features
 */
import dotenv from 'dotenv';
// Load environment variables MUST be at the top
dotenv.config();

import express from 'express';
import cors from 'cors';
import { apiRouter } from './routes/index.js';

// Define a configuration object to centralize environment variables
const port = process.env.PORT || 3002;
const clientUrl = process.env.CLIENT_URL || 'http://localhost:3102';
const serverUrl = process.env.SERVER_URL || 'http://localhost:3002';
const extraOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5173'];

const config = {
  port,
  clientUrl,
  serverUrl,
  // Auto-merge CLIENT_URL into allowed origins
  corsOrigin: [clientUrl, ...extraOrigins],
  // If there were other services or specific configurations, they would go here
};

const app = express();
const PORT = config.port; // Use config object

// Middleware
app.use(cors({
  origin: config.corsOrigin, // Use config object
  credentials: true,
}));
app.use(express.json());

// Routes
app.use('/api/story-weaver', apiRouter);

// Health check
app.get('/health', (_req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'story-weaver-api',
    timestamp: new Date().toISOString(),
  });
});

// Error handling
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({ 
    success: false, 
    error: err.message || 'Internal server error' 
  });
});

app.listen(PORT, () => {
  console.log(`🎬 Story Weaver API running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
});
