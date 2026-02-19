import winston from 'winston';

const { combine, timestamp, json, errors, colorize, printf } = winston.format;

const devFormat = printf(({ level, message, timestamp, correlationId, ...metadata }) => {
  let msg = `${timestamp} [${level}]`;
  if (correlationId) msg += ` [${correlationId}]`;
  msg += `: ${message}`;
  if (Object.keys(metadata).length > 0) msg += ` ${JSON.stringify(metadata)}`;
  return msg;
});

const logLevel = process.env.LOG_LEVEL || 'info';
const isProduction = process.env.NODE_ENV === 'production';

export const logger = winston.createLogger({
  level: logLevel,
  defaultMeta: { service: 'permission-service' },
  format: combine(errors({ stack: true }), timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }), json()),
  transports: [
    new winston.transports.Console({
      format: isProduction
        ? combine(timestamp(), json())
        : combine(colorize(), timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }), devFormat),
    }),
  ],
  exitOnError: false,
});
