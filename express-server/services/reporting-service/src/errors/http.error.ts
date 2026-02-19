export class HttpError extends Error {
  constructor(public statusCode: number, message: string, public errorCode: string) { super(message); this.name = 'HttpError'; }
}
