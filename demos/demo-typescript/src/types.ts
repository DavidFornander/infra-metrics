/**
 * Shared TypeScript types and interfaces
 */

export interface ServerConfig {
  port: number;
  serviceName: string;
  environment: string;
}

export interface HealthResponse {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  uptime: number;
}

export interface ReadyResponse {
  status: 'ready' | 'not_ready';
  timestamp: string;
  checks: {
    [key: string]: boolean;
  };
}
