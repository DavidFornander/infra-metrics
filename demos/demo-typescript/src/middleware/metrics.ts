import { Request, Response, NextFunction } from 'express';
import {
  httpRequestDuration,
  httpRequestsTotal,
  httpRequestsInFlight,
} from '../telemetry/metrics';

/**
 * Express middleware to track HTTP request metrics
 * 
 * This middleware:
 * - Increments in-flight requests when request starts
 * - Tracks request duration
 * - Records total requests by method, route, and status code
 * - Decrements in-flight requests when response completes
 */
export function metricsMiddleware(req: Request, res: Response, next: NextFunction): void {
  // Start timer for this request
  const start = Date.now();

  // Increment in-flight requests
  httpRequestsInFlight.inc();

  // Hook into response finish event
  res.on('finish', () => {
    // Calculate request duration in seconds
    const duration = (Date.now() - start) / 1000;

    // Get route pattern (e.g., /api/users/:id instead of /api/users/123)
    // This prevents high cardinality in metrics
    const route = req.route?.path || req.path;

    // Normalize route for metrics (avoid high cardinality)
    const normalizedRoute = normalizeRoute(route);

    const labels = {
      method: req.method,
      route: normalizedRoute,
      status_code: res.statusCode.toString(),
    };

    // Record metrics
    httpRequestDuration.observe(labels, duration);
    httpRequestsTotal.inc(labels);

    // Decrement in-flight requests
    httpRequestsInFlight.dec();
  });

  next();
}

/**
 * Normalize route to prevent high cardinality in metrics
 * 
 * Examples:
 * - /api/users/123 -> /api/users/:id
 * - /api/orders/abc-def-123 -> /api/orders/:id
 * - /health -> /health (unchanged)
 */
function normalizeRoute(route: string): string {
  // If route is already parameterized (from Express route), use it
  if (route.includes(':')) {
    return route;
  }

  // For paths like /metrics, /health, etc. - return as-is
  if (!route.includes('/api/')) {
    return route;
  }

  // Normalize API routes: replace IDs with :id
  // This is a simple heuristic - adjust based on your routing patterns
  return route
    .split('/')
    .map((segment) => {
      // If segment looks like an ID (UUID, numeric, etc.), replace with :id
      if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(segment)) {
        return ':id'; // UUID
      }
      if (/^\d+$/.test(segment)) {
        return ':id'; // Numeric ID
      }
      if (/^[a-zA-Z0-9_-]{10,}$/.test(segment)) {
        return ':id'; // Long alphanumeric string (likely an ID)
      }
      return segment;
    })
    .join('/');
}
