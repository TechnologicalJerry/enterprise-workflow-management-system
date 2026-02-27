// ============================================
// Service Unavailable Errors
// ============================================

import { BaseError, type ErrorDetails } from './base.error.js';
import { HTTP_STATUS } from '../constants/http-status.constants.js';
import { ERROR_CODES } from '../constants/error-codes.constants.js';

export class ServiceUnavailableError extends BaseError {
  public readonly serviceName?: string;
  public readonly retryAfter?: number;

  constructor(message: string = 'Service temporarily unavailable', serviceName?: string, retryAfter?: number) {
    super(message, ERROR_CODES.SERVICE_UNAVAILABLE, HTTP_STATUS.SERVICE_UNAVAILABLE, true, {
      serviceName,
      retryAfter,
    });
    this.serviceName = serviceName;
    this.retryAfter = retryAfter;
  }
}

export class ExternalServiceError extends BaseError {
  public readonly serviceName: string;
  public readonly originalError?: Error;

  constructor(serviceName: string, message?: string, originalError?: Error) {
    super(
      message ?? `External service '${serviceName}' error`,
      ERROR_CODES.EXTERNAL_SERVICE_ERROR,
      HTTP_STATUS.BAD_GATEWAY,
      true,
      {
        serviceName,
        originalMessage: originalError?.message,
      }
    );
    this.serviceName = serviceName;
    this.originalError = originalError;
  }
}

export class ExternalServiceTimeoutError extends BaseError {
  public readonly serviceName: string;
  public readonly timeout: number;

  constructor(serviceName: string, timeout: number) {
    super(
      `External service '${serviceName}' timed out after ${timeout}ms`,
      ERROR_CODES.EXTERNAL_SERVICE_TIMEOUT,
      HTTP_STATUS.GATEWAY_TIMEOUT,
      true,
      {
        serviceName,
        timeout,
      }
    );
    this.serviceName = serviceName;
    this.timeout = timeout;
  }
}

export class CircuitBreakerOpenError extends BaseError {
  public readonly serviceName: string;
  public readonly resetTimeout: number;

  constructor(serviceName: string, resetTimeout: number) {
    super(
      `Circuit breaker is open for service '${serviceName}'`,
      ERROR_CODES.CIRCUIT_BREAKER_OPEN,
      HTTP_STATUS.SERVICE_UNAVAILABLE,
      true,
      {
        serviceName,
        resetTimeout,
      }
    );
    this.serviceName = serviceName;
    this.resetTimeout = resetTimeout;
  }
}

export class DatabaseConnectionError extends ServiceUnavailableError {
  constructor(message: string = 'Database connection failed') {
    super(message, 'database');
  }
}

export class RedisConnectionError extends ServiceUnavailableError {
  constructor(message: string = 'Redis connection failed') {
    super(message, 'redis');
  }
}

export class KafkaConnectionError extends ServiceUnavailableError {
  constructor(message: string = 'Kafka connection failed') {
    super(message, 'kafka');
  }
}
