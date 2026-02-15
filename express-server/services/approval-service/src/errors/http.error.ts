export class HttpError extends Error {
  constructor(public statusCode: number, message: string, public errorCode: string, public details?: unknown[]) { super(message); this.name = 'HttpError'; }
}
