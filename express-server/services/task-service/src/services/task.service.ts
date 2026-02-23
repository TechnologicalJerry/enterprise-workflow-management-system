import { prisma } from '../database/prisma.js';
import { HttpError } from '../errors/http.error.js';
import { HTTP_STATUS, ERROR_CODES } from '@workflow/shared';

export const taskService = {
  async list(opts: { page?: number; limit?: number; status?: string; assigneeId?: string; priority?: string; userId?: string }) {
    const page = Math.max(1, opts.page ?? 1);
    const limit = Math.min(100, opts.limit ?? 20);
    const where: { status?: string; assigneeId?: string; priority?: string } = {};
    if (opts.status) where.status = opts.status;
    if (opts.assigneeId) where.assigneeId = opts.assigneeId;
    if (opts.priority) where.priority = opts.priority;
    const [items, total] = await Promise.all([
      prisma.task.findMany({ where, skip: (page - 1) * limit, take: limit, orderBy: { createdAt: 'desc' } }),
      prisma.task.count({ where }),
    ]);
    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  },
  async getById(id: string) {
    const task = await prisma.task.findUnique({ where: { id } });
    if (!task) throw new HttpError(HTTP_STATUS.NOT_FOUND, 'Task not found', ERROR_CODES.TASK.NOT_FOUND);
    return task;
  },
  async getMyTasks(userId: string, opts: { page?: number; limit?: number }) {
    return this.list({ ...opts, assigneeId: userId });
  },
  async create(data: { title: string; description?: string; assigneeId?: string; priority?: string; dueDate?: Date; workflowInstanceId?: string; parentTaskId?: string; tags?: string[]; metadata?: object; createdBy?: string }) {
    return prisma.task.create({
      data: {
        title: data.title,
        description: data.description,
        assigneeId: data.assigneeId,
        priority: data.priority ?? 'normal',
        dueDate: data.dueDate,
        workflowInstanceId: data.workflowInstanceId,
        parentTaskId: data.parentTaskId,
        tags: data.tags ?? [],
        metadata: (data.metadata ?? {}) as object,
        createdBy: data.createdBy,
      },
    });
  },
  async update(id: string, data: { title?: string; description?: string; assigneeId?: string | null; priority?: string; dueDate?: Date | null; tags?: string[]; metadata?: object }) {
    await this.getById(id);
    return prisma.task.update({ where: { id }, data: { ...data, metadata: data.metadata as object | undefined } });
  },
  async updateStatus(id: string, status: string, comment?: string) {
    await this.getById(id);
    return prisma.task.update({ where: { id }, data: { status } });
  },
  async assign(id: string, assigneeId: string) {
    await this.getById(id);
    return prisma.task.update({ where: { id }, data: { assigneeId } });
  },
  async getComments(taskId: string) {
    return prisma.taskComment.findMany({ where: { taskId }, orderBy: { createdAt: 'desc' } });
  },
  async addComment(taskId: string, content: string, authorId: string) {
    await this.getById(taskId);
    return prisma.taskComment.create({ data: { taskId, content, authorId } });
  },
  async delete(id: string) {
    await this.getById(id);
    await prisma.task.delete({ where: { id } });
  },
};
