// ============================================
// Prometheus Metrics
// ============================================

import { Application, Request, Response, NextFunction } from 'express';
import promClient from 'prom-client';

// Create a registry
const register = new promClient.Registry();

// Add default metrics (CPU, memory, etc.)
promClient.collectDefaultMetrics({
  register,
  prefix: 'gateway_',
});

// Custom metrics
const httpRequestsTotal = new promClient.Counter({
  name: 'gateway_http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'path', 'status_code'],
  registers: [register],
});

const httpRequestDuration = new promClient.Histogram({
  name: 'gateway_http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'path', 'status_code'],
  buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5, 10],
  registers: [register],
});

const activeConnections = new promClient.Gauge({
  name: 'gateway_active_connections',
  help: 'Number of active connections',
  registers: [register],
});

const circuitBreakerState = new promClient.Gauge({
  name: 'gateway_circuit_breaker_state',
  help: 'Circuit breaker state (0=closed, 1=open, 2=half-open)',
  labelNames: ['service'],
  registers: [register],
});

const proxyRequestsTotal = new promClient.Counter({
  name: 'gateway_proxy_requests_total',
  help: 'Total number of proxy requests to backend services',
  labelNames: ['service', 'status_code'],
  registers: [register],
});

const proxyRequestDuration = new promClient.Histogram({
  name: 'gateway_proxy_request_duration_seconds',
  help: 'Duration of proxy requests to backend services',
  labelNames: ['service'],
  buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5, 10],
  registers: [register],
});

// Register metrics endpoint
export const registerMetrics = (app: Application): void => {
  app.get('/metrics', async (_req: Request, res: Response) => {
    try {
      res.set('Content-Type', register.contentType);
      res.end(await register.metrics());
    } catch (error) {
      res.status(500).end(error instanceof Error ? error.message : 'Error generating metrics');
    }
  });
};

// Metrics middleware
export const metricsMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Skip metrics endpoint itself
  if (req.path === '/metrics') {
    next();
    return;
  }

  activeConnections.inc();
  const startTime = Date.now();

  // Normalize path (replace IDs with placeholders)
  const normalizedPath = req.path
    .replace(/\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi, '/:id')
    .replace(/\/\d+/g, '/:id');

  res.on('finish', () => {
    const duration = (Date.now() - startTime) / 1000;
    const labels = {
      method: req.method,
      path: normalizedPath,
      status_code: res.statusCode.toString(),
    };

    httpRequestsTotal.inc(labels);
    httpRequestDuration.observe(labels, duration);
    activeConnections.dec();
  });

  next();
};

// Exported metrics for use in other modules
export const metrics = {
  httpRequestsTotal,
  httpRequestDuration,
  activeConnections,
  circuitBreakerState,
  proxyRequestsTotal,
  proxyRequestDuration,
  register,
};
