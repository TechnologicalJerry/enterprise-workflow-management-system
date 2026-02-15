import { Request, Response, NextFunction } from 'express';
import { approvalService } from '../services/approval.service.js';
import { HTTP_STATUS } from '@workflow/shared';
declare global { namespace Express { interface Request { correlationId: string; userId?: string } } }

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await approvalService.list({ page: Number(req.query.page) || 1, limit: Number(req.query.limit) || 20, status: req.query.status as string, type: req.query.type as string });
    res.status(HTTP_STATUS.OK).json({ success: true, data: result.items, pagination: { currentPage: result.page, itemsPerPage: result.limit, totalItems: result.total, totalPages: result.totalPages } });
  } catch (e) { next(e); }
}

export async function getPending(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as any).userId;
    if (!userId) return res.status(HTTP_STATUS.UNAUTHORIZED).json({ success: false, error: { code: 'ERR_2010', message: 'User context required' } });
    const result = await approvalService.getPendingForUser(userId, { page: Number(req.query.page) || 1, limit: Number(req.query.limit) || 20 });
    res.status(HTTP_STATUS.OK).json({ success: true, data: result.items, pagination: { currentPage: result.page, itemsPerPage: result.limit, totalItems: result.total, totalPages: result.totalPages } });
  } catch (e) { next(e); }
}

export async function getMyRequests(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as any).userId;
    if (!userId) return res.status(HTTP_STATUS.UNAUTHORIZED).json({ success: false, error: { code: 'ERR_2010', message: 'User context required' } });
    const result = await approvalService.list({ page: Number(req.query.page) || 1, limit: Number(req.query.limit) || 20 });
    res.status(HTTP_STATUS.OK).json({ success: true, data: result.items, pagination: { currentPage: result.page, itemsPerPage: result.limit, totalItems: result.total, totalPages: result.totalPages } });
  } catch (e) { next(e); }
}

export async function getById(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await approvalService.getById(req.params.id);
    res.status(HTTP_STATUS.OK).json({ success: true, data });
  } catch (e) { next(e); }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const body = req.body as { title: string; description?: string; type: string; approvers: { userId: string; order?: number; required?: boolean }[]; workflowInstanceId?: string; entityType?: string; entityId?: string; dueDate?: string; metadata?: object };
    const created = await approvalService.create({
      ...body,
      dueDate: body.dueDate ? new Date(body.dueDate) : undefined,
      createdBy: (req as any).userId ?? 'system',
    });
    res.status(HTTP_STATUS.CREATED).json({ success: true, data: created });
  } catch (e) { next(e); }
}

export async function decide(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as any).userId;
    if (!userId) return res.status(HTTP_STATUS.UNAUTHORIZED).json({ success: false, error: { code: 'ERR_2010', message: 'User context required' } });
    const { decision, comment } = req.body as { decision: string; comment?: string };
    const updated = await approvalService.decide(req.params.id, userId, decision, comment);
    res.status(HTTP_STATUS.OK).json({ success: true, data: updated });
  } catch (e) { next(e); }
}

export async function cancel(req: Request, res: Response, next: NextFunction) {
  try {
    const updated = await approvalService.cancel(req.params.id);
    res.status(HTTP_STATUS.OK).json({ success: true, data: updated });
  } catch (e) { next(e); }
}

export async function getHistory(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await approvalService.getHistory(req.params.id);
    res.status(HTTP_STATUS.OK).json({ success: true, data });
  } catch (e) { next(e); }
}
