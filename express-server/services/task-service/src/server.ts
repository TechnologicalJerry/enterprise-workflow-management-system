import 'dotenv/config';
import http from 'http';
import { createApp } from './app.js';
import { appConfig } from './config/app.config.js';
import { logger } from './utils/logger.js';
import { connectDatabase, disconnectDatabase } from './database/prisma.js';
async function start() {
  await connectDatabase();
  const server = http.createServer(createApp());
  server.listen(appConfig.service.port, appConfig.service.host, () => { logger.info(`${appConfig.service.name} started`, { port: appConfig.service.port }); });
  process.on('SIGTERM', () => { server.close(() => disconnectDatabase().then(() => process.exit(0))); });
  process.on('SIGINT', () => { server.close(() => disconnectDatabase().then(() => process.exit(0))); });
}
start().catch((e) => { logger.error('Start failed', e); process.exit(1); });
