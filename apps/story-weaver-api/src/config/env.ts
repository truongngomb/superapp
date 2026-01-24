import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const clientUrl = process.env.CLIENT_URL || 'http://localhost:3102';
const extraOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5173'];

export const config = {
  port: process.env.STORY_WEAVER_PORT || process.env.PORT || 3002,
  env: process.env.NODE_ENV || 'development',
  clientUrl,
  serverUrl: process.env.SERVER_URL || 'http://localhost:3002',
  cors: {
    origin: [clientUrl, ...extraOrigins],
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
