import { Request, Response, NextFunction } from 'express';
import { notificationService } from '../services/notification.service.js';
import { HTTP_STATUS } from '@workflow/shared';
declare global { namespace Express { interface Request { correlationId: string; userId?: string } } }

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as any).userId;
    if (!userId) return res.status(HTTP_STATUS.UNAUTHORIZED).json({ success: false, error: { code: 'ERR_2010', message: 'User context required' } });
    const result = await notificationService.listForUser(userId, {
      page: Number(req.query.page) || 1,
      limit: Number(req.query.limit) || 20,
      read: req.query.read === 'true' ? true : req.query.read === 'false' ? false : undefined,
      type: req.query.type as string,
    });
    res.status(HTTP_STATUS.OK).json({ success: true, data: result.items, pagination: { currentPage: result.page, itemsPerPage: result.limit, totalItems: result.total, totalPages: result.totalPages } });
  } catch (e) { next(e); }
}

export async function unreadCount(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as any).userId;
    if (!userId) return res.status(HTTP_STATUS.UNAUTHORIZED).json({ success: false, error: { code: 'ERR_2010', message: 'User context required' } });
    const count = await notificationService.getUnreadCount(userId);
    res.status(HTTP_STATUS.OK).json({ success: true, data: { count } });
  } catch (e) { next(e); }
}

export async function getById(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as any).userId;
    if (!userId) return res.status(HTTP_STATUS.UNAUTHORIZED).json({ success: false, error: { code: 'ERR_2010', message: 'User context required' } });
    const data = await notificationService.getById(req.params.id, userId);
    res.status(HTTP_STATUS.OK).json({ success: true, data });
  } catch (e) { next(e); }
}

export async function markRead(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as any).userId;
    if (!userId) return res.status(HTTP_STATUS.UNAUTHORIZED).json({ success: false, error: { code: 'ERR_2010', message: 'User context required' } });
    const data = await notificationService.markRead(req.params.id, userId);
    res.status(HTTP_STATUS.OK).json({ success: true, data });
  } catch (e) { next(e); }
}

export async function markAllRead(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as any).userId;
    if (!userId) return res.status(HTTP_STATUS.UNAUTHORIZED).json({ success: false, error: { code: 'ERR_2010', message: 'User context required' } });
    const data = await notificationService.markAllRead(userId);
    res.status(HTTP_STATUS.OK).json({ success: true, data });
  } catch (e) { next(e); }
}

export async function deleteNotification(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as any).userId;
    if (!userId) return res.status(HTTP_STATUS.UNAUTHORIZED).json({ success: false, error: { code: 'ERR_2010', message: 'User context required' } });
    await notificationService.delete(req.params.id, userId);
    res.status(HTTP_STATUS.OK).json({ success: true, message: 'Notification deleted' });
  } catch (e) { next(e); }
}

export async function getPreferences(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as any).userId;
    if (!userId) return res.status(HTTP_STATUS.UNAUTHORIZED).json({ success: false, error: { code: 'ERR_2010', message: 'User context required' } });
    const data = await notificationService.getPreferences(userId);
    res.status(HTTP_STATUS.OK).json({ success: true, data });
  } catch (e) { next(e); }
}

export async function updatePreferences(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as any).userId;
    if (!userId) return res.status(HTTP_STATUS.UNAUTHORIZED).json({ success: false, error: { code: 'ERR_2010', message: 'User context required' } });
    const data = await notificationService.updatePreferences(userId, req.body);
    res.status(HTTP_STATUS.OK).json({ success: true, data });
  } catch (e) { next(e); }
}
