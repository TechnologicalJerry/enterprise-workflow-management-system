// ============================================
// HTTP Error Classes
// ============================================

import { BaseError, type ErrorDetails } from './base.error.js';
import { HTTP_STATUS } from '../constants/http-status.constants.js';
import { ERROR_CODES } from '../constants/error-codes.constants.js';
import type { ErrorCode } from '../constants/error-codes.constants.js';
import type { HttpStatusCode } from '../constants/http-status.constants.js';

export class HttpError extends BaseError {
  constructor(
    message: string,
    statusCode: HttpStatusCode,
    code: ErrorCode = ERROR_CODES.INTERNAL_ERROR,
    details?: ErrorDetails
  ) {
    super(message, code, statusCode, true, details);
  }
}

export class BadRequestError extends HttpError {
  constructor(message: string = 'Bad Request', details?: ErrorDetails) {
    super(message, HTTP_STATUS.BAD_REQUEST, ERROR_CODES.BAD_REQUEST, details);
  }
}

export class UnprocessableEntityError extends HttpError {
  constructor(message: string = 'Unprocessable Entity', details?: ErrorDetails) {
    super(message, HTTP_STATUS.UNPROCESSABLE_ENTITY, ERROR_CODES.VALIDATION_ERROR, details);
  }
}

export class MethodNotAllowedError extends HttpError {
  constructor(message: string = 'Method Not Allowed', details?: ErrorDetails) {
    super(message, HTTP_STATUS.METHOD_NOT_ALLOWED, ERROR_CODES.BAD_REQUEST, details);
  }
}

export class GoneError extends HttpError {
  constructor(message: string = 'Resource no longer available', details?: ErrorDetails) {
    super(message, HTTP_STATUS.GONE, ERROR_CODES.NOT_FOUND, details);
  }
}

export class InternalServerError extends HttpError {
  constructor(message: string = 'Internal Server Error', details?: ErrorDetails) {
    super(message, HTTP_STATUS.INTERNAL_SERVER_ERROR, ERROR_CODES.INTERNAL_ERROR, details);
  }
}

export class BadGatewayError extends HttpError {
  constructor(message: string = 'Bad Gateway', details?: ErrorDetails) {
    super(message, HTTP_STATUS.BAD_GATEWAY, ERROR_CODES.EXTERNAL_SERVICE_ERROR, details);
  }
}

export class GatewayTimeoutError extends HttpError {
  constructor(message: string = 'Gateway Timeout', details?: ErrorDetails) {
    super(message, HTTP_STATUS.GATEWAY_TIMEOUT, ERROR_CODES.EXTERNAL_SERVICE_TIMEOUT, details);
  }
}
