// ============================================
// Winston Logger Configuration
// ============================================

import winston from 'winston';

const { combine, timestamp, json, errors, colorize, printf } = winston.format;

// Custom format for development
const devFormat = printf(({ level, message, timestamp, correlationId, ...metadata }) => {
  let msg = `${timestamp} [${level}]`;
  if (correlationId) {
    msg += ` [${correlationId}]`;
  }
  msg += `: ${message}`;
  
  if (Object.keys(metadata).length > 0) {
    msg += ` ${JSON.stringify(metadata)}`;
  }
  
  return msg;
});

// Determine log level from environment
const logLevel = process.env.LOG_LEVEL || 'info';
const isProduction = process.env.NODE_ENV === 'production';

// Create Winston logger
export const logger = winston.createLogger({
  level: logLevel,
  defaultMeta: { service: 'api-gateway' },
  format: combine(
    errors({ stack: true }),
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
    json()
  ),
  transports: [
    // Console transport
    new winston.transports.Console({
      format: isProduction
        ? combine(timestamp(), json())
        : combine(
            colorize(),
            timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
            devFormat
          ),
    }),
  ],
  // Don't exit on unhandled exceptions
  exitOnError: false,
});

// Add file transports in production
if (isProduction) {
  logger.add(
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      maxsize: 10 * 1024 * 1024, // 10MB
      maxFiles: 5,
    })
  );
  
  logger.add(
    new winston.transports.File({
      filename: 'logs/combined.log',
      maxsize: 10 * 1024 * 1024, // 10MB
      maxFiles: 10,
    })
  );
}

// Stream for Morgan HTTP logging (if needed)
export const loggerStream = {
  write: (message: string): void => {
    logger.info(message.trim());
  },
};
