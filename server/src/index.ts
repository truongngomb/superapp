/**
 * Server Entry Point
 * 
 * Starts the Express server and handles graceful shutdown.
 */
import { EventSource } from 'eventsource';

// Polyfill for PocketBase Realtime SDK
// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
if (!(global as any).EventSource) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
  (global as any).EventSource = EventSource;
}

import app from './app.js';
import { config, checkPocketBaseHealth } from './config/index.js';
import { createLogger } from './utils/index.js';

const log = createLogger('Server');

// =============================================================================
// Server Startup
// =============================================================================

async function startServer(): Promise<void> {
  // Check database connectivity
  const dbHealthy = await checkPocketBaseHealth();
  
  if (!dbHealthy) {
    log.warn('PocketBase is not available. Server will start with limited functionality.');
  }

  // Start Express server
  const server = app.listen(config.port, () => {
    log.info(`
🚀 SuperApp Server is running!
📍 Environment: ${config.nodeEnv}
🌐 URL: ${config.serverUrl}
📚 API: ${config.serverUrl}/api
❤️  Health: ${config.serverUrl}/api/health
🗄️  Database: ${dbHealthy ? 'Connected' : 'Unavailable'}
    `);
  });

  // Graceful shutdown
  const shutdown = (signal: string) => {
    log.info(`${signal} received. Shutting down gracefully...`);
    server.close(() => {
      log.info('Server closed.');
      process.exit(0);
    });

    // Force close after 10 seconds
    setTimeout(() => {
      log.error('Forced shutdown after timeout.');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', () => { shutdown('SIGTERM'); });
  process.on('SIGINT', () => { shutdown('SIGINT'); });
}

// =============================================================================
// Run
// =============================================================================

startServer().catch((error: unknown) => {
  log.error('Failed to start server', error);
  process.exit(1);
});
