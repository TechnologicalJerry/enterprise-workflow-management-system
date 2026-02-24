import { Request, Response, NextFunction } from 'express';
import { workflowDefinitionService } from '../services/workflow-definition.service.js';
import { HTTP_STATUS } from '@workflow/shared';

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const category = req.query.category as string | undefined;
    const status = req.query.status as string | undefined;
    const result = await workflowDefinitionService.list({ page, limit, category, status });
    res.status(HTTP_STATUS.OK).json({ success: true, data: result.items, pagination: { currentPage: result.page, itemsPerPage: result.limit, totalItems: result.total, totalPages: result.totalPages } });
  } catch (e) { next(e); }
}

export async function getById(req: Request, res: Response, next: NextFunction) {
  try {
    const def = await workflowDefinitionService.getById(req.params.id);
    res.status(HTTP_STATUS.OK).json({ success: true, data: def });
  } catch (e) { next(e); }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const created = await workflowDefinitionService.create({ ...req.body, createdBy: (req as any).userId });
    res.status(HTTP_STATUS.CREATED).json({ success: true, data: created });
  } catch (e) { next(e); }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const updated = await workflowDefinitionService.update(req.params.id, req.body);
    res.status(HTTP_STATUS.OK).json({ success: true, data: updated });
  } catch (e) { next(e); }
}

export async function publish(req: Request, res: Response, next: NextFunction) {
  try {
    const updated = await workflowDefinitionService.publish(req.params.id);
    res.status(HTTP_STATUS.OK).json({ success: true, data: updated });
  } catch (e) { next(e); }
}

export async function deprecate(req: Request, res: Response, next: NextFunction) {
  try {
    const updated = await workflowDefinitionService.deprecate(req.params.id);
    res.status(HTTP_STATUS.OK).json({ success: true, data: updated });
  } catch (e) { next(e); }
}
