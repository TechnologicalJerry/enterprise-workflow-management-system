import { prisma } from '../database/prisma.js';
import { HttpError } from '../errors/http.error.js';
import { HTTP_STATUS, ERROR_CODES } from '@workflow/shared';

export const approvalService = {
  async list(opts: { page?: number; limit?: number; status?: string; type?: string }) {
    const page = Math.max(1, opts.page ?? 1);
    const limit = Math.min(100, opts.limit ?? 20);
    const where: { status?: string; type?: string } = {};
    if (opts.status) where.status = opts.status;
    if (opts.type) where.type = opts.type;
    const [items, total] = await Promise.all([
      prisma.approvalRequest.findMany({ where, skip: (page - 1) * limit, take: limit, orderBy: { createdAt: 'desc' }, include: { approvers: true } }),
      prisma.approvalRequest.count({ where }),
    ]);
    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  },
  async getPendingForUser(userId: string, opts: { page?: number; limit?: number }) {
    const page = Math.max(1, opts.page ?? 1);
    const limit = Math.min(100, opts.limit ?? 20);
    const approvers = await prisma.approvalApprover.findMany({
      where: { userId, status: 'pending' },
      include: { request: true },
      skip: (page - 1) * limit,
      take: limit,
    });
    const items = approvers.map((a) => a.request).filter((r) => r.status === 'pending');
    const total = await prisma.approvalApprover.count({ where: { userId, status: 'pending' } });
    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  },
  async getMyRequests(createdBy: string, opts: { page?: number; limit?: number }) {
    return this.list({ ...opts, page: opts.page, limit: opts.limit } as any);
  },
  async getById(id: string) {
    const req = await prisma.approvalRequest.findUnique({ where: { id }, include: { approvers: true, decisions: true } });
    if (!req) throw new HttpError(HTTP_STATUS.NOT_FOUND, 'Approval request not found', ERROR_CODES.APPROVAL.NOT_FOUND);
    return req;
  },
  async create(data: { title: string; description?: string; type: string; approvers: { userId: string; order?: number; required?: boolean }[]; workflowInstanceId?: string; entityType?: string; entityId?: string; dueDate?: Date; createdBy: string; metadata?: object }) {
    const request = await prisma.approvalRequest.create({
      data: {
        title: data.title,
        description: data.description,
        type: data.type,
        workflowInstanceId: data.workflowInstanceId,
        entityType: data.entityType,
        entityId: data.entityId,
        dueDate: data.dueDate,
        createdBy: data.createdBy,
        metadata: (data.metadata ?? {}) as object,
      },
    });
    await prisma.approvalApprover.createMany({
      data: data.approvers.map((a, i) => ({ requestId: request.id, userId: a.userId, order: a.order ?? i, required: a.required ?? true })),
    });
    return this.getById(request.id);
  },
  async decide(id: string, userId: string, decision: string, comment?: string) {
    const req = await this.getById(id);
    if (req.status !== 'pending') throw new HttpError(HTTP_STATUS.BAD_REQUEST, 'Approval already processed', ERROR_CODES.APPROVAL.ALREADY_PROCESSED);
    const approver = req.approvers.find((a) => a.userId === userId);
    if (!approver) throw new HttpError(HTTP_STATUS.FORBIDDEN, 'Not an approver', ERROR_CODES.APPROVAL.NOT_APPROVER);
    await prisma.$transaction([
      prisma.approvalDecision.create({ data: { requestId: id, userId, decision, comment } }),
      prisma.approvalApprover.updateMany({ where: { requestId: id, userId }, data: { status: decision === 'approve' ? 'approved' : decision === 'reject' ? 'rejected' : 'pending' } }),
    ]);
    const allApproved = (await prisma.approvalApprover.findMany({ where: { requestId: id, required: true } })).every((a) => a.status === 'approved');
    const anyRejected = (await prisma.approvalApprover.findMany({ where: { requestId: id } })).some((a) => a.status === 'rejected');
    const newStatus = anyRejected ? 'rejected' : allApproved ? 'approved' : 'pending';
    await prisma.approvalRequest.update({ where: { id }, data: { status: newStatus } });
    return this.getById(id);
  },
  async cancel(id: string) {
    const req = await this.getById(id);
    if (req.status !== 'pending') throw new HttpError(HTTP_STATUS.BAD_REQUEST, 'Cannot cancel', ERROR_CODES.GENERAL.BAD_REQUEST);
    return prisma.approvalRequest.update({ where: { id }, data: { status: 'cancelled' } });
  },
  async getHistory(id: string) {
    return prisma.approvalDecision.findMany({ where: { requestId: id }, orderBy: { createdAt: 'desc' } });
  },
};
