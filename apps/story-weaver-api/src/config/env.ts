import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

export const config = {
  port: process.env.STORY_WEAVER_PORT || process.env.PORT || 3003,
  env: process.env.NODE_ENV || 'development',
  cors: {
    origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:5173'],
  },
  ai: {
    geminiApiKey: process.env.GEMINI_API_KEY || '',
  },
  pocketbase: {
    url: process.env.POCKETBASE_URL || 'http://localhost:8090',
    adminEmail: process.env.POCKETBASE_ADMIN_EMAIL || '',
    adminPassword: process.env.POCKETBASE_ADMIN_PASSWORD || '',
  }
};
