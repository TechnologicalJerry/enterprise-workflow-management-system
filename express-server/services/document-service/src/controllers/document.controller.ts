import { Request, Response, NextFunction } from 'express';
import { documentService, storeFile, getFile } from '../services/document.service.js';
import { HTTP_STATUS } from '@workflow/shared';
import crypto from 'crypto';

declare global { namespace Express { interface Request { correlationId: string; userId?: string } } }

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await documentService.list({
      page: Number(req.query.page) || 1,
      limit: Number(req.query.limit) || 20,
      folderId: req.query.folderId as string,
      entityType: req.query.entityType as string,
      entityId: req.query.entityId as string,
    });
    res.status(HTTP_STATUS.OK).json({ success: true, data: result.items, pagination: { currentPage: result.page, itemsPerPage: result.limit, totalItems: result.total, totalPages: result.totalPages } });
  } catch (e) { next(e); }
}

export async function getById(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await documentService.getById(req.params.id);
    res.status(HTTP_STATUS.OK).json({ success: true, data });
  } catch (e) { next(e); }
}

export async function upload(req: Request, res: Response, next: NextFunction) {
  try {
    const body = (req.body || {}) as { name?: string; content?: string; mimeType?: string; folderId?: string; entityType?: string; entityId?: string };
    const name = body.name || 'upload';
    const content = body.content ? Buffer.from(body.content, 'base64') : Buffer.from('');
    const mimeType = body.mimeType || 'application/octet-stream';
    const storageKey = `docs/${crypto.randomUUID()}`;
    storeFile(storageKey, content);
    const created = await documentService.create({
      name,
      storageKey,
      mimeType,
      size: content.length,
      folderId: body.folderId,
      entityType: body.entityType,
      entityId: body.entityId,
      uploadedBy: (req as any).userId,
    });
    res.status(HTTP_STATUS.CREATED).json({ success: true, data: created });
  } catch (e) { next(e); }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const updated = await documentService.update(req.params.id, req.body);
    res.status(HTTP_STATUS.OK).json({ success: true, data: updated });
  } catch (e) { next(e); }
}

export async function deleteDoc(req: Request, res: Response, next: NextFunction) {
  try {
    await documentService.delete(req.params.id);
    res.status(HTTP_STATUS.OK).json({ success: true, message: 'Document deleted' });
  } catch (e) { next(e); }
}

export async function download(req: Request, res: Response, next: NextFunction) {
  try {
    const doc = await documentService.getById(req.params.id);
    const buffer = getFile(doc.storageKey);
    if (!buffer) return res.status(HTTP_STATUS.NOT_FOUND).json({ success: false, error: { code: 'ERR_8000', message: 'File not found' } });
    res.setHeader('Content-Type', doc.mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${doc.name}"`);
    res.send(buffer);
  } catch (e) { next(e); }
}

export async function getVersions(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await documentService.getVersions(req.params.id);
    res.status(HTTP_STATUS.OK).json({ success: true, data });
  } catch (e) { next(e); }
}

export async function listFolders(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await documentService.listFolders(req.query.parentId as string | undefined);
    res.status(HTTP_STATUS.OK).json({ success: true, data });
  } catch (e) { next(e); }
}

export async function createFolder(req: Request, res: Response, next: NextFunction) {
  try {
    const created = await documentService.createFolder(req.body);
    res.status(HTTP_STATUS.CREATED).json({ success: true, data: created });
  } catch (e) { next(e); }
}
