import { Request, Response, NextFunction } from 'express';
import { taskService } from '../services/task.service.js';
import { HTTP_STATUS } from '@workflow/shared';
declare global { namespace Express { interface Request { correlationId: string; userId?: string } } }

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await taskService.list({
      page: Number(req.query.page) || 1,
      limit: Number(req.query.limit) || 20,
      status: req.query.status as string,
      assigneeId: req.query.assigneeId as string,
      priority: req.query.priority as string,
    });
    res.status(HTTP_STATUS.OK).json({ success: true, data: result.items, pagination: { currentPage: result.page, itemsPerPage: result.limit, totalItems: result.total, totalPages: result.totalPages } });
  } catch (e) { next(e); }
}

export async function getMyTasks(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as any).userId;
    if (!userId) return res.status(HTTP_STATUS.UNAUTHORIZED).json({ success: false, error: { code: 'ERR_2010', message: 'User context required' } });
    const result = await taskService.getMyTasks(userId, { page: Number(req.query.page) || 1, limit: Number(req.query.limit) || 20 });
    res.status(HTTP_STATUS.OK).json({ success: true, data: result.items, pagination: { currentPage: result.page, itemsPerPage: result.limit, totalItems: result.total, totalPages: result.totalPages } });
  } catch (e) { next(e); }
}

export async function getById(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await taskService.getById(req.params.id);
    res.status(HTTP_STATUS.OK).json({ success: true, data });
  } catch (e) { next(e); }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const body = req.body as { title: string; description?: string; assigneeId?: string; priority?: string; dueDate?: string; workflowInstanceId?: string; parentTaskId?: string; tags?: string[] };
    const created = await taskService.create({
      ...body,
      dueDate: body.dueDate ? new Date(body.dueDate) : undefined,
      createdBy: (req as any).userId,
    });
    res.status(HTTP_STATUS.CREATED).json({ success: true, data: created });
  } catch (e) { next(e); }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const body = req.body as { title?: string; description?: string; assigneeId?: string | null; priority?: string; dueDate?: string | null; tags?: string[] };
    const updated = await taskService.update(req.params.id, { ...body, dueDate: body.dueDate ? new Date(body.dueDate) : undefined });
    res.status(HTTP_STATUS.OK).json({ success: true, data: updated });
  } catch (e) { next(e); }
}

export async function updateStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const { status, comment } = req.body as { status: string; comment?: string };
    const updated = await taskService.updateStatus(req.params.id, status, comment);
    res.status(HTTP_STATUS.OK).json({ success: true, data: updated });
  } catch (e) { next(e); }
}

export async function assign(req: Request, res: Response, next: NextFunction) {
  try {
    const { assigneeId } = req.body as { assigneeId: string };
    const updated = await taskService.assign(req.params.id, assigneeId);
    res.status(HTTP_STATUS.OK).json({ success: true, data: updated });
  } catch (e) { next(e); }
}

export async function getComments(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await taskService.getComments(req.params.id);
    res.status(HTTP_STATUS.OK).json({ success: true, data });
  } catch (e) { next(e); }
}

export async function addComment(req: Request, res: Response, next: NextFunction) {
  try {
    const { content } = req.body as { content: string };
    const userId = (req as any).userId;
    if (!userId) return res.status(HTTP_STATUS.UNAUTHORIZED).json({ success: false, error: { code: 'ERR_2010', message: 'User context required' } });
    const created = await taskService.addComment(req.params.id, content, userId);
    res.status(HTTP_STATUS.CREATED).json({ success: true, data: created });
  } catch (e) { next(e); }
}

export async function deleteTask(req: Request, res: Response, next: NextFunction) {
  try {
    await taskService.delete(req.params.id);
    res.status(HTTP_STATUS.OK).json({ success: true, message: 'Task deleted' });
  } catch (e) { next(e); }
}
