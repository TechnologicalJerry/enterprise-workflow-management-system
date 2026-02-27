// ============================================
// Rate Limit Errors
// ============================================

import { BaseError, type ErrorDetails } from './base.error.js';
import { HTTP_STATUS } from '../constants/http-status.constants.js';
import { ERROR_CODES } from '../constants/error-codes.constants.js';

export class RateLimitError extends BaseError {
  public readonly retryAfter: number;
  public readonly limit: number;
  public readonly remaining: number;

  constructor(
    retryAfter: number,
    limit: number,
    remaining: number = 0,
    message: string = 'Too many requests'
  ) {
    super(message, ERROR_CODES.RATE_LIMIT_EXCEEDED, HTTP_STATUS.TOO_MANY_REQUESTS, true, {
      retryAfter,
      limit,
      remaining,
    });
    this.retryAfter = retryAfter;
    this.limit = limit;
    this.remaining = remaining;
  }

  public getRetryAfterHeader(): string {
    return String(this.retryAfter);
  }
}

export class QuotaExceededError extends BaseError {
  public readonly quotaType: string;
  public readonly limit: number;
  public readonly used: number;
  public readonly resetAt: Date;

  constructor(quotaType: string, limit: number, used: number, resetAt: Date) {
    super(
      `${quotaType} quota exceeded: ${used}/${limit}`,
      ERROR_CODES.QUOTA_EXCEEDED,
      HTTP_STATUS.TOO_MANY_REQUESTS,
      true,
      { quotaType, limit, used, resetAt: resetAt.toISOString() }
    );
    this.quotaType = quotaType;
    this.limit = limit;
    this.used = used;
    this.resetAt = resetAt;
  }
}

export class LoginRateLimitError extends RateLimitError {
  public readonly email: string;
  public readonly attemptCount: number;

  constructor(email: string, attemptCount: number, retryAfter: number) {
    super(
      retryAfter,
      5, // Max login attempts
      0,
      `Too many login attempts for ${email}. Please try again later.`
    );
    this.email = email;
    this.attemptCount = attemptCount;
  }
}
