// ============================================
// Logger Interface
// ============================================

export interface ILogger {
  debug(message: string, meta?: LogMeta): void;
  info(message: string, meta?: LogMeta): void;
  warn(message: string, meta?: LogMeta): void;
  error(message: string, error?: Error, meta?: LogMeta): void;
  fatal(message: string, error?: Error, meta?: LogMeta): void;
  child(bindings: LogMeta): ILogger;
  setLevel(level: LogLevel): void;
  isLevelEnabled(level: LogLevel): boolean;
}

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';

export interface LogMeta {
  correlationId?: string;
  userId?: string;
  serviceName?: string;
  traceId?: string;
  spanId?: string;
  requestId?: string;
  method?: string;
  path?: string;
  statusCode?: number;
  duration?: number;
  [key: string]: unknown;
}

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  service: string;
  environment: string;
  meta?: LogMeta;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

export interface ILogTransport {
  log(entry: LogEntry): void | Promise<void>;
  flush?(): Promise<void>;
}

export interface LoggerConfig {
  level: LogLevel;
  serviceName: string;
  environment: string;
  transports: ILogTransport[];
  redactPaths?: string[];
  prettyPrint?: boolean;
}

export interface IStructuredLogger extends ILogger {
  startSpan(name: string, meta?: LogMeta): SpanContext;
  endSpan(span: SpanContext): void;
}

export interface SpanContext {
  spanId: string;
  traceId: string;
  parentSpanId?: string;
  startTime: number;
  name: string;
  meta?: LogMeta;
}
