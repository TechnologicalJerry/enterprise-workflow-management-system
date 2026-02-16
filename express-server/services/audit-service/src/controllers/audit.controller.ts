import { Request, Response, NextFunction } from 'express';
import { auditService } from '../services/audit.service.js';
import { HTTP_STATUS } from '@workflow/shared';

declare global { namespace Express { interface Request { correlationId: string; userId?: string } } }

export async function log(req: Request, res: Response, next: NextFunction) {
  try {
    const body = req.body as { service: string; entityType: string; entityId: string; action: string; payload?: object };
    const created = await auditService.log({
      ...body,
      userId: (req as any).userId,
      correlationId: (req as any).correlationId,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });
    res.status(HTTP_STATUS.CREATED).json({ success: true, data: created });
  } catch (e) { next(e); }
}

export async function query(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await auditService.query({
      page: Number(req.query.page) || 1,
      limit: Number(req.query.limit) || 20,
      service: req.query.service as string,
      entityType: req.query.entityType as string,
      entityId: req.query.entityId as string,
      userId: req.query.userId as string,
      startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
      endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined,
    });
    res.status(HTTP_STATUS.OK).json({ success: true, data: result.items, pagination: { currentPage: result.page, itemsPerPage: result.limit, totalItems: result.total, totalPages: result.totalPages } });
  } catch (e) { next(e); }
}
