import { prisma } from '../database/prisma.js';
import { HttpError } from '../errors/http.error.js';
import { HTTP_STATUS, ERROR_CODES } from '@workflow/shared';

export const workflowDefinitionService = {
  async list(options: { page?: number; limit?: number; category?: string; status?: string }) {
    const page = Math.max(1, options.page ?? 1);
    const limit = Math.min(100, options.limit ?? 20);
    const skip = (page - 1) * limit;
    const where: { category?: string; status?: string } = {};
    if (options.category) where.category = options.category;
    if (options.status) where.status = options.status;
    const [items, total] = await Promise.all([
      prisma.workflowDefinition.findMany({ where, skip, take: limit, orderBy: { updatedAt: 'desc' } }),
      prisma.workflowDefinition.count({ where }),
    ]);
    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  },
  async getById(id: string) {
    const def = await prisma.workflowDefinition.findUnique({ where: { id } });
    if (!def) throw new HttpError(HTTP_STATUS.NOT_FOUND, 'Workflow definition not found', ERROR_CODES.WORKFLOW.NOT_FOUND);
    return def;
  },
  async create(data: { name: string; description?: string; category?: string; version?: string; steps: unknown[]; metadata?: object; createdBy?: string }) {
    return prisma.workflowDefinition.create({
      data: {
        name: data.name,
        description: data.description,
        category: data.category,
        version: data.version ?? '1.0.0',
        steps: data.steps as object,
        metadata: (data.metadata ?? {}) as object,
        createdBy: data.createdBy,
      },
    });
  },
  async update(id: string, data: { name?: string; description?: string; category?: string; steps?: unknown[]; metadata?: object }) {
    await this.getById(id);
    return prisma.workflowDefinition.update({
      where: { id },
      data: {
        ...(data.name != null && { name: data.name }),
        ...(data.description != null && { description: data.description }),
        ...(data.category != null && { category: data.category }),
        ...(data.steps != null && { steps: data.steps as object }),
        ...(data.metadata != null && { metadata: data.metadata as object }),
      },
    });
  },
  async publish(id: string) {
    const def = await this.getById(id);
    if (def.status !== 'draft') throw new HttpError(HTTP_STATUS.BAD_REQUEST, 'Only draft can be published', ERROR_CODES.WORKFLOW.INVALID_STATE);
    return prisma.workflowDefinition.update({ where: { id }, data: { status: 'active' } });
  },
  async deprecate(id: string) {
    await this.getById(id);
    return prisma.workflowDefinition.update({ where: { id }, data: { status: 'deprecated' } });
  },
};
