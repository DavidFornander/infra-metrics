import { app, logger } from './server';
import { ServerConfig } from './types';

const config: ServerConfig = {
  port: parseInt(process.env.PORT || '8080', 10),
  serviceName: process.env.SERVICE_NAME || 'demo-typescript',
  environment: process.env.NODE_ENV || 'development',
};

const server = app.listen(config.port, () => {
  logger.info(
    {
      port: config.port,
      service: config.serviceName,
      environment: config.environment,
    },
    `🚀 Server started successfully`
  );
});

// Graceful shutdown
const shutdown = (signal: string) => {
  logger.info({ signal }, 'Received shutdown signal');
  
  server.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });

  // Force shutdown after 10 seconds
  setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// Handle uncaught errors
process.on('uncaughtException', (err) => {
  logger.fatal({ err }, 'Uncaught exception');
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.fatal({ reason, promise }, 'Unhandled rejection');
  process.exit(1);
});
