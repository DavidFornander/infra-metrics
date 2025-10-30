import { Router, Request, Response } from 'express';
import { HealthResponse, ReadyResponse } from '../types';

const router = Router();

// Process start time for uptime calculation
const startTime = Date.now();

/**
 * Liveness probe - Is the process alive?
 * This should always return 200 unless the process is completely dead.
 * Kubernetes uses this to determine if it should restart the pod.
 */
router.get('/health', (_req: Request, res: Response) => {
  const uptime = Math.floor((Date.now() - startTime) / 1000);

  const response: HealthResponse = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime,
  };

  res.status(200).json(response);
});

/**
 * Readiness probe - Is the service ready to accept traffic?
 * This checks dependencies (database, cache, external services).
 * For this demo, we'll keep it simple and always return ready.
 * In production, you'd check actual dependencies here.
 */
router.get('/ready', (_req: Request, res: Response) => {
  // In a real service, check dependencies here:
  // - Database connection
  // - Redis/cache availability
  // - Required external services
  // - Any initialization that must complete

  const checks = {
    database: true, // Mock: would actually check DB connection
    cache: true, // Mock: would actually check Redis/cache
    dependencies: true, // Mock: would check external APIs
  };

  const allReady = Object.values(checks).every((check) => check === true);

  const response: ReadyResponse = {
    status: allReady ? 'ready' : 'not_ready',
    timestamp: new Date().toISOString(),
    checks,
  };

  const statusCode = allReady ? 200 : 503;
  res.status(statusCode).json(response);
});

export default router;
