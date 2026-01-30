/**
 * Server Entry Point
 * 
 * Starts the Express server and handles graceful shutdown.
 */
import { EventSource } from 'eventsource';

// Polyfill for PocketBase Realtime SDK
// eslint-disable-next-line @typescript-eslint/no-explicit-any
if (!(global as any).EventSource) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (global as any).EventSource = EventSource;
}

import app from './app.js';
import { config, checkPocketBaseHealth } from './config/index.js';
import { logger } from './utils/logger.js';

// =============================================================================
// Server Startup
// =============================================================================

async function startServer(): Promise<void> {
  // Check database connectivity
  const dbHealthy = await checkPocketBaseHealth();
  
  if (!dbHealthy) {
    logger.warn('Server', 'PocketBase is not available. Server will start with limited functionality.');
  } else {
    // Initialize default settings
    const { settingService } = await import('./services/setting.service.js');
    await settingService.initDefaults();
  }

  // Start Express server
  const server = app.listen(config.port, () => {
    logger.info('Server', `
🚀 Story Weaver API is running!
📍 Environment: ${config.nodeEnv}
🌐 URL: ${config.serverUrl}
📚 API: ${config.serverUrl}/api
❤️  Health: ${config.serverUrl}/api/health
🗄️  Database: ${dbHealthy ? 'Connected' : 'Unavailable'}
    `);
  });

  // Graceful shutdown
  const shutdown = (signal: string) => {
    logger.info('Server', `${signal} received. Shutting down gracefully...`);
    server.close(() => {
      logger.info('Server', 'Server closed.');
      process.exit(0);
    });

    // Force close after timeout
    setTimeout(() => {
      logger.error('Server', 'Forced shutdown after timeout.');
      process.exit(1);
    }, config.server.gracefulShutdownTimeout);
  };

  process.on('SIGTERM', () => { shutdown('SIGTERM'); });
  process.on('SIGINT', () => { shutdown('SIGINT'); });
}

// =============================================================================
// Run
// =============================================================================

startServer().catch((error: unknown) => {
  logger.error('Server', 'Failed to start server', error);
  process.exit(1);
});
