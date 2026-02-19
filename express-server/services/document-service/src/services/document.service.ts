import { prisma } from '../database/prisma.js';
import { HttpError } from '../errors/http.error.js';
import { HTTP_STATUS, ERROR_CODES } from '@workflow/shared';
import crypto from 'crypto';

export const documentService = {
  async list(opts: { page?: number; limit?: number; folderId?: string; entityType?: string; entityId?: string }) {
    const page = Math.max(1, opts.page ?? 1);
    const limit = Math.min(100, opts.limit ?? 20);
    const where: { folderId?: string; entityType?: string; entityId?: string } = {};
    if (opts.folderId) where.folderId = opts.folderId;
    if (opts.entityType) where.entityType = opts.entityType;
    if (opts.entityId) where.entityId = opts.entityId;
    const [items, total] = await Promise.all([
      prisma.document.findMany({ where, skip: (page - 1) * limit, take: limit, orderBy: { createdAt: 'desc' } }),
      prisma.document.count({ where }),
    ]);
    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  },
  async getById(id: string) {
    const doc = await prisma.document.findUnique({ where: { id } });
    if (!doc) throw new HttpError(HTTP_STATUS.NOT_FOUND, 'Document not found', ERROR_CODES.DOCUMENT.NOT_FOUND);
    return doc;
  },
  async create(data: { name: string; description?: string; storageKey: string; mimeType: string; size: number; folderId?: string; entityType?: string; entityId?: string; uploadedBy?: string; metadata?: object }) {
    return prisma.document.create({
      data: {
        name: data.name,
        description: data.description,
        storageKey: data.storageKey,
        mimeType: data.mimeType,
        size: data.size,
        folderId: data.folderId,
        entityType: data.entityType,
        entityId: data.entityId,
        uploadedBy: data.uploadedBy,
        metadata: (data.metadata ?? {}) as object,
      },
    });
  },
  async update(id: string, data: { name?: string; description?: string; folderId?: string | null; metadata?: object }) {
    await this.getById(id);
    return prisma.document.update({ where: { id }, data: { ...data, metadata: data.metadata as object | undefined } });
  },
  async delete(id: string) {
    await this.getById(id);
    await prisma.document.delete({ where: { id } });
  },
  async getVersions(id: string) {
    const doc = await this.getById(id);
    return prisma.document.findMany({ where: { name: doc.name, entityId: doc.entityId }, orderBy: { version: 'desc' } });
  },
  listFolders: (parentId?: string | null) => prisma.documentFolder.findMany({ where: { parentId }, orderBy: { name: 'asc' } }),
  createFolder: (data: { name: string; parentId?: string; description?: string }) => prisma.documentFolder.create({ data }),
};

// In-memory stub for file storage (replace with S3/MinIO in production)
const fileStore = new Map<string, Buffer>();
export function storeFile(key: string, buffer: Buffer) { fileStore.set(key, buffer); }
export function getFile(key: string): Buffer | undefined { return fileStore.get(key); }
