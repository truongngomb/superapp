import 'dotenv/config';
import { logger } from '../utils/index.js';

interface Config {
  port: number;
  nodeEnv: 'development' | 'production' | 'test';
  clientUrl: string;
  serverUrl: string;
  pocketbaseUrl?: string;
}

const getEnv = (key: string, defaultValue?: string): string => {
  const value = process.env[key];
  if (!value && defaultValue === undefined) {
    if (process.env['NODE_ENV'] === 'production') {
      throw new Error(`Environment variable ${key} is missing`);
    }
    logger.warn('Config', `Environment variable ${key} is missing`);
  }
  return value || defaultValue || '';
};

export const config: Config = {
  port: parseInt(getEnv('PORT', '3000'), 10),
  nodeEnv: (getEnv('NODE_ENV', 'development') as Config['nodeEnv']) || 'development',
  clientUrl: getEnv('CLIENT_URL', 'http://localhost:5173'),
  serverUrl: getEnv('SERVER_URL', 'http://localhost:3000'),
  pocketbaseUrl: getEnv('POCKETBASE_URL'),
};
