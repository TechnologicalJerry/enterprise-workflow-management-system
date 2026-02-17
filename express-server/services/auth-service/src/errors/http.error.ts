// ============================================
// HTTP Error Class
// ============================================

export class HttpError extends Error {
  public readonly statusCode: number;
  public readonly errorCode: string;
  public readonly details?: unknown[];
  public readonly isOperational: boolean;

  constructor(
    statusCode: number,
    message: string,
    errorCode: string,
    details?: unknown[]
  ) {
    super(message);
    
    this.name = 'HttpError';
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.details = details;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }

  toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      statusCode: this.statusCode,
      errorCode: this.errorCode,
      message: this.message,
      details: this.details,
    };
  }
}
