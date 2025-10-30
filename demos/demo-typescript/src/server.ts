import express, { Request, Response, NextFunction } from 'express';
import pino from 'pino';
import pinoHttp from 'pino-http';
import healthRoutes from './routes/health';

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'HH:MM:ss Z',
      ignore: 'pid,hostname',
    },
  },
});

export const app = express();

// Middleware
app.use(express.json());
app.use(pinoHttp({ logger }));

// Routes
app.use(healthRoutes);

// Root endpoint
app.get('/', (_req: Request, res: Response) => {
  logger.info('Root endpoint accessed');
  res.json({
    service: 'demo-typescript',
    version: '1.0.0',
    message: 'Hello from demo-typescript observability service!',
    endpoints: {
      health: '/health',
      ready: '/ready',
      metrics: '/metrics',
      api: '/api/users',
    },
  });
});

// Error handling middleware
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  logger.error({ err }, 'Unhandled error');
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message,
  });
});

export { logger };
