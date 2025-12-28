import app from './app.js';
import { config } from './config/index.js';
import { logger } from './utils/index.js';

// Start server
app.listen(config.port, () => {
  logger.info('Server', `
🚀 SuperApp Server is running!
📍 Environment: ${config.nodeEnv}
🌐 URL: http://localhost:${config.port}
📚 API: http://localhost:${config.port}/api
❤️  Health: http://localhost:${config.port}/api/health
  `);
});
