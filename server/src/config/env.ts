import 'dotenv/config';

/**
 * Validate required environment variables
 */
const requiredEnvVars = [
  'POCKETBASE_URL',
  'PORT',
  'CLIENT_URL',
  'SERVER_URL',
  'NODE_ENV'
];

const missingVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingVars.length > 0) {
  throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
}

export const config = {
  pocketbaseUrl: process.env['POCKETBASE_URL']!,
  port: parseInt(process.env['PORT']!, 10),
  nodeEnv: process.env['NODE_ENV']!,
  clientUrl: process.env['CLIENT_URL']!,
  serverUrl: process.env['SERVER_URL']!,
};
