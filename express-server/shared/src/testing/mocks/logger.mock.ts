// ============================================
// Logger Mock
// ============================================

import type { ILogger, LogLevel, LogMeta } from '../../interfaces/logger.interface.js';

export function createMockLogger(): ILogger & { logs: Array<{ level: LogLevel; message: string; meta?: LogMeta }> } {
  const logs: Array<{ level: LogLevel; message: string; meta?: LogMeta; error?: Error }> = [];

  const logger: ILogger & { logs: typeof logs } = {
    logs,
    debug: (message: string, meta?: LogMeta) => {
      logs.push({ level: 'debug', message, meta });
    },
    info: (message: string, meta?: LogMeta) => {
      logs.push({ level: 'info', message, meta });
    },
    warn: (message: string, meta?: LogMeta) => {
      logs.push({ level: 'warn', message, meta });
    },
    error: (message: string, error?: Error, meta?: LogMeta) => {
      logs.push({ level: 'error', message, meta, error });
    },
    fatal: (message: string, error?: Error, meta?: LogMeta) => {
      logs.push({ level: 'fatal', message, meta, error });
    },
    child: () => logger,
    setLevel: () => {},
    isLevelEnabled: () => true,
  };

  return logger;
}

export function createSilentLogger(): ILogger {
  return {
    debug: () => {},
    info: () => {},
    warn: () => {},
    error: () => {},
    fatal: () => {},
    child: function() { return this; },
    setLevel: () => {},
    isLevelEnabled: () => false,
  };
}
