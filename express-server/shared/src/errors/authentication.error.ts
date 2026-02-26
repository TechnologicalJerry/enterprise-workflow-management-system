// ============================================
// Authentication Errors
// ============================================

import { BaseError, type ErrorDetails } from './base.error.js';
import { HTTP_STATUS } from '../constants/http-status.constants.js';
import { ERROR_CODES } from '../constants/error-codes.constants.js';

export class AuthenticationError extends BaseError {
  constructor(message: string = 'Authentication required', details?: ErrorDetails) {
    super(message, ERROR_CODES.UNAUTHORIZED, HTTP_STATUS.UNAUTHORIZED, true, details);
  }
}

export class InvalidCredentialsError extends BaseError {
  constructor(message: string = 'Invalid email or password', details?: ErrorDetails) {
    super(message, ERROR_CODES.INVALID_CREDENTIALS, HTTP_STATUS.UNAUTHORIZED, true, details);
  }
}

export class TokenExpiredError extends BaseError {
  constructor(message: string = 'Token has expired', details?: ErrorDetails) {
    super(message, ERROR_CODES.TOKEN_EXPIRED, HTTP_STATUS.UNAUTHORIZED, true, details);
  }
}

export class TokenInvalidError extends BaseError {
  constructor(message: string = 'Token is invalid', details?: ErrorDetails) {
    super(message, ERROR_CODES.TOKEN_INVALID, HTTP_STATUS.UNAUTHORIZED, true, details);
  }
}

export class TokenRevokedError extends BaseError {
  constructor(message: string = 'Token has been revoked', details?: ErrorDetails) {
    super(message, ERROR_CODES.TOKEN_REVOKED, HTTP_STATUS.UNAUTHORIZED, true, details);
  }
}

export class SessionExpiredError extends BaseError {
  constructor(message: string = 'Session has expired', details?: ErrorDetails) {
    super(message, ERROR_CODES.SESSION_EXPIRED, HTTP_STATUS.UNAUTHORIZED, true, details);
  }
}

export class RefreshTokenInvalidError extends BaseError {
  constructor(message: string = 'Refresh token is invalid', details?: ErrorDetails) {
    super(message, ERROR_CODES.REFRESH_TOKEN_INVALID, HTTP_STATUS.UNAUTHORIZED, true, details);
  }
}

export class RefreshTokenExpiredError extends BaseError {
  constructor(message: string = 'Refresh token has expired', details?: ErrorDetails) {
    super(message, ERROR_CODES.REFRESH_TOKEN_EXPIRED, HTTP_STATUS.UNAUTHORIZED, true, details);
  }
}

export class MfaRequiredError extends BaseError {
  constructor(message: string = 'Multi-factor authentication required', details?: ErrorDetails) {
    super(message, ERROR_CODES.MFA_REQUIRED, HTTP_STATUS.UNAUTHORIZED, true, details);
  }
}

export class MfaInvalidError extends BaseError {
  constructor(message: string = 'Invalid MFA code', details?: ErrorDetails) {
    super(message, ERROR_CODES.MFA_INVALID, HTTP_STATUS.UNAUTHORIZED, true, details);
  }
}
