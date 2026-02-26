// ============================================
// API Response DTOs
// ============================================

import type { PaginationMeta } from '../types/pagination.types.js';
import type { ApiResponse, ApiError, ResponseMeta, ValidationError } from '../types/api-response.types.js';
import type { ErrorCode } from '../constants/error-codes.constants.js';

export class ApiResponseDto<T = unknown> implements ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
  meta?: ResponseMeta;
  timestamp: string;
  correlationId: string;

  private constructor(
    success: boolean,
    correlationId: string,
    data?: T,
    error?: ApiError,
    meta?: ResponseMeta
  ) {
    this.success = success;
    this.data = data;
    this.error = error;
    this.meta = meta;
    this.timestamp = new Date().toISOString();
    this.correlationId = correlationId;
  }

  static success<T>(data: T, correlationId: string, meta?: ResponseMeta): ApiResponseDto<T> {
    return new ApiResponseDto(true, correlationId, data, undefined, meta);
  }

  static error(error: ApiError, correlationId: string, meta?: ResponseMeta): ApiResponseDto<never> {
    return new ApiResponseDto(false, correlationId, undefined, error, meta);
  }

  static paginated<T>(
    data: T[],
    pagination: PaginationMeta,
    correlationId: string
  ): ApiResponseDto<T[]> {
    return new ApiResponseDto(true, correlationId, data, undefined, { pagination });
  }

  static noContent(correlationId: string): ApiResponseDto<null> {
    return new ApiResponseDto(true, correlationId, null);
  }
}

export function createSuccessResponse<T>(
  data: T,
  correlationId: string,
  meta?: ResponseMeta
): ApiResponse<T> {
  return {
    success: true,
    data,
    meta,
    timestamp: new Date().toISOString(),
    correlationId,
  };
}

export function createErrorResponse(
  code: ErrorCode,
  message: string,
  correlationId: string,
  details?: ValidationError[] | Record<string, unknown>
): ApiResponse<never> {
  return {
    success: false,
    error: { code, message, details },
    timestamp: new Date().toISOString(),
    correlationId,
  };
}

export function createPaginatedResponse<T>(
  data: T[],
  pagination: PaginationMeta,
  correlationId: string
): ApiResponse<T[]> {
  return {
    success: true,
    data,
    meta: { pagination },
    timestamp: new Date().toISOString(),
    correlationId,
  };
}
