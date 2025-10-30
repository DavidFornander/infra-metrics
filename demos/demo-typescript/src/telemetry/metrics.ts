import { Registry, collectDefaultMetrics, Counter, Histogram, Gauge } from 'prom-client';

/**
 * Prometheus Metrics Setup
 * 
 * This module initializes Prometheus metrics collection including:
 * - Default Node.js metrics (heap, CPU, event loop, etc.)
 * - Custom HTTP metrics (request duration, count, in-flight)
 */

// Create a new registry (single source of truth for all metrics)
export const register = new Registry();

// Collect default metrics (Node.js runtime metrics)
collectDefaultMetrics({
  register,
  prefix: 'nodejs_',
  gcDurationBuckets: [0.001, 0.01, 0.1, 1, 2, 5], // GC duration buckets in seconds
});

/**
 * HTTP Request Duration Histogram
 * Tracks how long HTTP requests take to process
 * Labels: method, route, status_code
 */
export const httpRequestDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.001, 0.005, 0.015, 0.05, 0.1, 0.2, 0.3, 0.4, 0.5, 1, 2, 5], // Buckets in seconds
  registers: [register],
});

/**
 * HTTP Requests Total Counter
 * Tracks total number of HTTP requests
 * Labels: method, route, status_code
 */
export const httpRequestsTotal = new Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register],
});

/**
 * HTTP Requests In-Flight Gauge
 * Tracks number of HTTP requests currently being processed
 */
export const httpRequestsInFlight = new Gauge({
  name: 'http_requests_in_flight',
  help: 'Number of HTTP requests currently being processed',
  registers: [register],
});

/**
 * Get metrics in Prometheus format
 */
export async function getMetrics(): Promise<string> {
  return register.metrics();
}

/**
 * Get content type for Prometheus metrics
 */
export function getMetricsContentType(): string {
  return register.contentType;
}
