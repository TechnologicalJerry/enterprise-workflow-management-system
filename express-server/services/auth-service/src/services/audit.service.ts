// ============================================
// Audit Logging Service
// ============================================

import { prisma } from '../database/prisma.js';
import { logger } from '../utils/logger.js';

export interface AuditLogEntry {
  userId?: string;
  email?: string;
  eventType: string;
  eventStatus: 'success' | 'failure';
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
  errorMessage?: string;
}

class AuditService {
  async log(entry: AuditLogEntry): Promise<void> {
    try {
      await prisma.authAuditLog.create({
        data: {
          userId: entry.userId,
          email: entry.email,
          eventType: entry.eventType,
          eventStatus: entry.eventStatus,
          ipAddress: entry.ipAddress,
          userAgent: entry.userAgent,
          metadata: entry.metadata ? entry.metadata : undefined,
          errorMessage: entry.errorMessage,
        },
      });

      logger.debug('Audit log created', {
        eventType: entry.eventType,
        eventStatus: entry.eventStatus,
        userId: entry.userId,
      });
    } catch (error) {
      // Don't throw - audit logging failures shouldn't break the main flow
      logger.error('Failed to create audit log', {
        error,
        entry,
      });
    }
  }

  async getAuditLogs(
    userId: string,
    options: {
      limit?: number;
      offset?: number;
      eventType?: string;
      startDate?: Date;
      endDate?: Date;
    } = {}
  ): Promise<{ logs: any[]; total: number }> {
    const where: any = { userId };

    if (options.eventType) {
      where.eventType = options.eventType;
    }

    if (options.startDate || options.endDate) {
      where.createdAt = {};
      if (options.startDate) {
        where.createdAt.gte = options.startDate;
      }
      if (options.endDate) {
        where.createdAt.lte = options.endDate;
      }
    }

    const [logs, total] = await Promise.all([
      prisma.authAuditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: options.limit || 50,
        skip: options.offset || 0,
      }),
      prisma.authAuditLog.count({ where }),
    ]);

    return { logs, total };
  }
}

export const auditService = new AuditService();
