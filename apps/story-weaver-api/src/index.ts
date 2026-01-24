/**
 * Story Weaver API Server
 * Microservice for video generation features
 */
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { apiRouter } from './routes/index.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3003;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(',') || 'http://localhost:5173',
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
