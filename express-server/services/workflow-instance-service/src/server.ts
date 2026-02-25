import 'dotenv/config';
import http from 'http';
import { createApp } from './app.js';
import { appConfig } from './config/app.config.js';
import { logger } from './utils/logger.js';
import { connectDatabase, disconnectDatabase } from './database/prisma.js';
async function start() {
  await connectDatabase();
  const app = createApp();
  const server = http.createServer(app);
  server.listen(appConfig.service.port, appConfig.service.host, () => { logger.info(`${appConfig.service.name} started`, { port: appConfig.service.port }); });
  const shutdown = () => { server.close(() => disconnectDatabase().then(() => process.exit(0))); };
  process.on('SIGTERM', shutdown); process.on('SIGINT', shutdown);
}
start().catch((e) => { logger.error('Start failed', e); process.exit(1); });
