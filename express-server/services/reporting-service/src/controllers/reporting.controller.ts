import { Request, Response, NextFunction } from 'express';
import { reportingService } from '../services/reporting.service.js';
import { HTTP_STATUS } from '@workflow/shared';
declare global { namespace Express { interface Request { correlationId: string; userId?: string } } }

export async function getDashboard(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await reportingService.getDashboard((req as any).correlationId);
    res.status(HTTP_STATUS.OK).json({ success: true, data });
  } catch (e) { next(e); }
}

export async function getDashboardWidgets(req: Request, res: Response, next: NextFunction) {
  try {
    res.status(HTTP_STATUS.OK).json({ success: true, data: [] });
  } catch (e) { next(e); }
}

export async function getWorkflowAnalytics(req: Request, res: Response, next: NextFunction) {
  try {
    const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
    const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;
    const data = await reportingService.getWorkflowAnalytics({ startDate, endDate });
    res.status(HTTP_STATUS.OK).json({ success: true, data });
  } catch (e) { next(e); }
}

export async function getTaskAnalytics(req: Request, res: Response, next: NextFunction) {
  try {
    const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
    const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;
    const data = await reportingService.getTaskAnalytics({ startDate, endDate });
    res.status(HTTP_STATUS.OK).json({ success: true, data });
  } catch (e) { next(e); }
}

export async function getApprovalAnalytics(req: Request, res: Response, next: NextFunction) {
  try {
    const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
    const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;
    const data = await reportingService.getApprovalAnalytics({ startDate, endDate });
    res.status(HTTP_STATUS.OK).json({ success: true, data });
  } catch (e) { next(e); }
}

export async function getUserActivity(req: Request, res: Response, next: NextFunction) {
  try {
    const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
    const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;
    const data = await reportingService.getUserActivity({ startDate, endDate });
    res.status(HTTP_STATUS.OK).json({ success: true, data });
  } catch (e) { next(e); }
}

export async function generateReport(req: Request, res: Response, next: NextFunction) {
  try {
    const body = req.body as { type: string; filters?: object; format?: string };
    const data = await reportingService.generateReport({ ...body, requestedBy: (req as any).userId });
    res.status(HTTP_STATUS.ACCEPTED).json({ success: true, data });
  } catch (e) { next(e); }
}

export async function getReport(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await reportingService.getReport(req.params.id);
    res.status(HTTP_STATUS.OK).json({ success: true, data });
  } catch (e) { next(e); }
}

export async function downloadReport(req: Request, res: Response, next: NextFunction) {
  try {
    const job = await reportingService.getReport(req.params.id);
    if (job.status !== 'completed' || !job.resultUrl) return res.status(HTTP_STATUS.NOT_FOUND).json({ success: false, error: { message: 'Report not ready' } });
    res.redirect(job.resultUrl);
  } catch (e) { next(e); }
}

export async function listScheduled(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await reportingService.listScheduled();
    res.status(HTTP_STATUS.OK).json({ success: true, data });
  } catch (e) { next(e); }
}

export async function cancelScheduled(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await reportingService.cancelScheduled(req.params.id);
    res.status(HTTP_STATUS.OK).json({ success: true, data });
  } catch (e) { next(e); }
}
