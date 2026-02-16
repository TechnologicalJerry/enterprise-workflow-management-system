import { prisma } from '../database/prisma.js';

export const auditService = {
  async log(data: { service: string; entityType: string; entityId: string; action: string; userId?: string; correlationId?: string; payload?: object; ipAddress?: string; userAgent?: string }) {
    return prisma.auditLog.create({
      data: {
        service: data.service,
        entityType: data.entityType,
        entityId: data.entityId,
        action: data.action,
        userId: data.userId,
        correlationId: data.correlationId,
        payload: (data.payload ?? {}) as object,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
      },
    });
  },
  async query(opts: { page?: number; limit?: number; service?: string; entityType?: string; entityId?: string; userId?: string; startDate?: Date; endDate?: Date }) {
    const page = Math.max(1, opts.page ?? 1);
    const limit = Math.min(100, opts.limit ?? 20);
    const where: { service?: string; entityType?: string; entityId?: string; userId?: string; createdAt?: { gte?: Date; lte?: Date } } = {};
    if (opts.service) where.service = opts.service;
    if (opts.entityType) where.entityType = opts.entityType;
    if (opts.entityId) where.entityId = opts.entityId;
    if (opts.userId) where.userId = opts.userId;
    if (opts.startDate || opts.endDate) {
      where.createdAt = {};
      if (opts.startDate) where.createdAt.gte = opts.startDate;
      if (opts.endDate) where.createdAt.lte = opts.endDate;
    }
    const [items, total] = await Promise.all([
      prisma.auditLog.findMany({ where, skip: (page - 1) * limit, take: limit, orderBy: { createdAt: 'desc' } }),
      prisma.auditLog.count({ where }),
    ]);
    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  },
};
