import { Request, Response, NextFunction } from 'express';
import { workflowInstanceService } from '../services/workflow-instance.service.js';
import { HTTP_STATUS } from '@workflow/shared';

declare global { namespace Express { interface Request { correlationId: string; userId?: string } } }

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await workflowInstanceService.list({
      page: Number(req.query.page) || 1,
      limit: Number(req.query.limit) || 20,
      status: req.query.status as string,
      definitionId: req.query.definitionId as string,
    });
    res.status(HTTP_STATUS.OK).json({ success: true, data: result.items, pagination: { currentPage: result.page, itemsPerPage: result.limit, totalItems: result.total, totalPages: result.totalPages } });
  } catch (e) { next(e); }
}

export async function getById(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await workflowInstanceService.getById(req.params.id);
    res.status(HTTP_STATUS.OK).json({ success: true, data });
  } catch (e) { next(e); }
}

export async function getHistory(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await workflowInstanceService.getHistory(req.params.id);
    res.status(HTTP_STATUS.OK).json({ success: true, data });
  } catch (e) { next(e); }
}

export async function start(req: Request, res: Response, next: NextFunction) {
  try {
    const body = req.body as { definitionId: string; name: string; context?: object; priority?: string; dueDate?: string };
    const created = await workflowInstanceService.start({
      ...body,
      dueDate: body.dueDate ? new Date(body.dueDate) : undefined,
      startedBy: (req as any).userId,
    });
    res.status(HTTP_STATUS.CREATED).json({ success: true, data: created });
  } catch (e) { next(e); }
}

export async function transition(req: Request, res: Response, next: NextFunction) {
  try {
    const body = req.body as { action: string; comment?: string; data?: object };
    const updated = await workflowInstanceService.transition(req.params.id, { ...body, performedBy: (req as any).userId });
    res.status(HTTP_STATUS.OK).json({ success: true, data: updated });
  } catch (e) { next(e); }
}

export async function cancel(req: Request, res: Response, next: NextFunction) {
  try {
    const updated = await workflowInstanceService.cancel(req.params.id);
    res.status(HTTP_STATUS.OK).json({ success: true, data: updated });
  } catch (e) { next(e); }
}
