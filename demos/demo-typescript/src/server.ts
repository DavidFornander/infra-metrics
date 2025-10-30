import express, { Request, Response, NextFunction } from 'express';
import pino from 'pino';
import pinoHttp from 'pino-http';
import healthRoutes from './routes/health';
import { getMetrics, getMetricsContentType } from './telemetry/metrics';

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

// Metrics endpoint
app.get('/metrics', async (_req: Request, res: Response) => {
  try {
    res.set('Content-Type', getMetricsContentType());
    const metrics = await getMetrics();
    res.send(metrics);
  } catch (error) {
    logger.error({ error }, 'Error generating metrics');
    res.status(500).send('Error generating metrics');
  }
});

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
