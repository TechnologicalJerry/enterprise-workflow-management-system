// ============================================
// Service Proxy - Forward Requests to Microservices
// ============================================

import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import { Request, Response } from 'express';
import CircuitBreaker from 'opossum';
import { servicesConfig, ServiceEndpoint } from '../config/services.config.js';
import { logger } from '../utils/logger.js';
import { HttpError } from '../errors/http.error.js';
import { HTTP_STATUS, ERROR_CODES } from '@workflow/shared';

// Circuit breaker options
const circuitBreakerOptions = {
  timeout: 30000, // 30 seconds
  errorThresholdPercentage: 50,
  resetTimeout: 30000, // 30 seconds
  volumeThreshold: 5,
};

// Store circuit breakers per service
const circuitBreakers = new Map<string, CircuitBreaker>();

// Get or create circuit breaker for a service
const getCircuitBreaker = (service: ServiceEndpoint): CircuitBreaker => {
  if (!circuitBreakers.has(service.name)) {
    const breaker = new CircuitBreaker(
      async (config: AxiosRequestConfig) => axios(config),
      {
        ...circuitBreakerOptions,
        timeout: service.timeout,
        name: service.name,
      }
    );

    // Circuit breaker events
    breaker.on('open', () => {
      logger.warn(`Circuit breaker OPEN for ${service.name}`);
    });

    breaker.on('halfOpen', () => {
      logger.info(`Circuit breaker HALF-OPEN for ${service.name}`);
    });

    breaker.on('close', () => {
      logger.info(`Circuit breaker CLOSED for ${service.name}`);
    });

    breaker.on('fallback', () => {
      logger.warn(`Circuit breaker fallback triggered for ${service.name}`);
    });

    circuitBreakers.set(service.name, breaker);
  }

  return circuitBreakers.get(service.name)!;
};

// Retry logic with exponential backoff
const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  retries: number,
  serviceName: string
): Promise<T> => {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      // Don't retry on client errors (4xx)
      if (axios.isAxiosError(error) && error.response?.status && error.response.status < 500) {
        throw error;
      }

      if (attempt < retries) {
        const delay = Math.pow(2, attempt) * 100; // Exponential backoff
        logger.warn(`Retry attempt ${attempt + 1}/${retries} for ${serviceName}`, {
          delay,
          error: lastError.message,
        });
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
};

// Build proxy request config
const buildProxyConfig = (
  req: Request,
  service: ServiceEndpoint,
  path: string
): AxiosRequestConfig => {
  // Forward headers (excluding hop-by-hop headers)
  const headers: Record<string, string> = {};
  const forwardHeaders = [
    'content-type',
    'accept',
    'accept-language',
    'authorization',
    'x-correlation-id',
    'x-request-id',
    'x-idempotency-key',
  ];

  forwardHeaders.forEach((header) => {
    if (req.headers[header]) {
      headers[header] = req.headers[header] as string;
    }
  });

  // Always include correlation ID
  headers['x-correlation-id'] = req.correlationId;

  // Add user info if authenticated
  if (req.user) {
    headers['x-user-id'] = req.user.sub;
    headers['x-user-email'] = req.user.email;
    headers['x-user-roles'] = JSON.stringify(req.user.roles);
  }

  return {
    method: req.method,
    url: `${service.url}${path}`,
    headers,
    data: req.body,
    params: req.query,
    timeout: service.timeout,
    validateStatus: () => true, // Don't throw on any status code
  };
};

// Forward request to service
export const proxyRequest = async (
  req: Request,
  res: Response,
  serviceName: keyof typeof servicesConfig,
  path: string
): Promise<void> => {
  const service = servicesConfig[serviceName];

  if (!service) {
    throw new HttpError(
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      `Unknown service: ${serviceName}`,
      ERROR_CODES.GENERAL.INTERNAL_ERROR
    );
  }

  const config = buildProxyConfig(req, service, path);
  const circuitBreaker = getCircuitBreaker(service);

  logger.debug(`Proxying request to ${service.name}`, {
    correlationId: req.correlationId,
    method: config.method,
    url: config.url,
  });

  try {
    // Execute request with circuit breaker and retry
    const response = await retryWithBackoff(
      () => circuitBreaker.fire(config) as Promise<AxiosResponse>,
      service.retries,
      service.name
    );

    // Forward response headers
    const responseHeaders = [
      'content-type',
      'x-correlation-id',
      'x-total-count',
      'x-page',
      'x-page-size',
      'x-total-pages',
    ];

    responseHeaders.forEach((header) => {
      if (response.headers[header]) {
        res.setHeader(header, response.headers[header]);
      }
    });

    // Send response
    res.status(response.status).json(response.data);

    logger.debug(`Proxy response from ${service.name}`, {
      correlationId: req.correlationId,
      statusCode: response.status,
    });
  } catch (error) {
    // Circuit breaker open
    if (error instanceof Error && error.message.includes('Breaker is open')) {
      throw new HttpError(
        HTTP_STATUS.SERVICE_UNAVAILABLE,
        `Service ${service.name} is temporarily unavailable`,
        ERROR_CODES.GENERAL.SERVICE_UNAVAILABLE
      );
    }

    // Axios error (from service response)
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<Record<string, unknown>>;

      // Service returned an error response
      if (axiosError.response) {
        res.status(axiosError.response.status).json(axiosError.response.data);
        return;
      }

      // Network error or timeout
      if (axiosError.code === 'ECONNABORTED') {
        throw new HttpError(
          HTTP_STATUS.GATEWAY_TIMEOUT,
          `Service ${service.name} request timeout`,
          ERROR_CODES.GENERAL.TIMEOUT
        );
      }

      if (axiosError.code === 'ECONNREFUSED') {
        throw new HttpError(
          HTTP_STATUS.SERVICE_UNAVAILABLE,
          `Service ${service.name} is unavailable`,
          ERROR_CODES.GENERAL.SERVICE_UNAVAILABLE
        );
      }
    }

    logger.error(`Proxy error for ${service.name}`, {
      correlationId: req.correlationId,
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    throw new HttpError(
      HTTP_STATUS.BAD_GATEWAY,
      `Failed to communicate with ${service.name}`,
      ERROR_CODES.GENERAL.BAD_GATEWAY
    );
  }
};

// Create proxy handler for a specific service
export const createProxyHandler = (serviceName: keyof typeof servicesConfig) => {
  return async (req: Request, res: Response, next: Function): Promise<void> => {
    try {
      // Extract the path after the service prefix
      const basePath = req.baseUrl;
      const fullPath = req.originalUrl;
      const servicePath = fullPath.replace(/^\/api\/v1/, '');

      await proxyRequest(req, res, serviceName, servicePath);
    } catch (error) {
      next(error);
    }
  };
};

// Health check for all services
export const checkServicesHealth = async (): Promise<Record<string, { healthy: boolean; latency?: number }>> => {
  const results: Record<string, { healthy: boolean; latency?: number }> = {};

  await Promise.all(
    Object.entries(servicesConfig).map(async ([name, service]) => {
      const start = Date.now();
      try {
        await axios.get(`${service.url}${service.healthPath}`, {
          timeout: 5000,
        });
        results[name] = {
          healthy: true,
          latency: Date.now() - start,
        };
      } catch {
        results[name] = {
          healthy: false,
        };
      }
    })
  );

  return results;
};
