import { prisma } from '../database/prisma.js';
import { HttpError } from '../errors/http.error.js';
import { HTTP_STATUS, ERROR_CODES } from '@workflow/shared';

export const notificationService = {
  async listForUser(userId: string, opts: { page?: number; limit?: number; read?: boolean; type?: string }) {
    const page = Math.max(1, opts.page ?? 1);
    const limit = Math.min(100, opts.limit ?? 20);
    const where: { userId: string; read?: boolean; type?: string } = { userId };
    if (opts.read !== undefined) where.read = opts.read;
    if (opts.type) where.type = opts.type;
    const [items, total] = await Promise.all([
      prisma.notification.findMany({ where, skip: (page - 1) * limit, take: limit, orderBy: { createdAt: 'desc' } }),
      prisma.notification.count({ where }),
    ]);
    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  },
  async getUnreadCount(userId: string) {
    return prisma.notification.count({ where: { userId, read: false } });
  },
  async getById(id: string, userId: string) {
    const n = await prisma.notification.findFirst({ where: { id, userId } });
    if (!n) throw new HttpError(HTTP_STATUS.NOT_FOUND, 'Notification not found', ERROR_CODES.GENERAL.NOT_FOUND);
    return n;
  },
  async markRead(id: string, userId: string) {
    await this.getById(id, userId);
    return prisma.notification.update({ where: { id }, data: { read: true } });
  },
  async markAllRead(userId: string) {
    await prisma.notification.updateMany({ where: { userId }, data: { read: true } });
    return { count: await prisma.notification.count({ where: { userId } }) };
  },
  async delete(id: string, userId: string) {
    await this.getById(id, userId);
    await prisma.notification.delete({ where: { id } });
  },
  async getPreferences(userId: string) {
    let prefs = await prisma.notificationPreferences.findUnique({ where: { userId } });
    if (!prefs) {
      prefs = await prisma.notificationPreferences.create({ data: { userId } });
    }
    return prefs;
  },
  async updatePreferences(userId: string, data: { email?: boolean; push?: boolean; inApp?: boolean; config?: object }) {
    await prisma.notificationPreferences.upsert({
      where: { userId },
      create: { userId, ...data },
      update: data,
    });
    return this.getPreferences(userId);
  },
  async create(data: { userId: string; type: string; title: string; body?: string; metadata?: object }) {
    return prisma.notification.create({
      data: {
        userId: data.userId,
        type: data.type,
        title: data.title,
        body: data.body,
        metadata: (data.metadata ?? {}) as object,
      },
    });
  },
};
