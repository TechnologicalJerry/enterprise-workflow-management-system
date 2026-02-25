import { prisma } from '../database/prisma.js';
import { getDefinitionById } from './definition-client.service.js';
import { HttpError } from '../errors/http.error.js';
import { HTTP_STATUS, ERROR_CODES } from '@workflow/shared';

export const workflowInstanceService = {
  async list(options: { page?: number; limit?: number; status?: string; definitionId?: string }) {
    const page = Math.max(1, options.page ?? 1);
    const limit = Math.min(100, options.limit ?? 20);
    const skip = (page - 1) * limit;
    const where: { status?: string; definitionId?: string } = {};
    if (options.status) where.status = options.status;
    if (options.definitionId) where.definitionId = options.definitionId;
    const [items, total] = await Promise.all([
      prisma.workflowInstance.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
      prisma.workflowInstance.count({ where }),
    ]);
    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  },
  async getById(id: string) {
    const inst = await prisma.workflowInstance.findUnique({ where: { id } });
    if (!inst) throw new HttpError(HTTP_STATUS.NOT_FOUND, 'Workflow instance not found', ERROR_CODES.WORKFLOW.INSTANCE_NOT_FOUND);
    return inst;
  },
  async getHistory(instanceId: string) {
    return prisma.workflowHistory.findMany({ where: { instanceId }, orderBy: { createdAt: 'desc' } });
  },
  async start(data: { definitionId: string; name: string; context?: object; priority?: string; dueDate?: Date; startedBy?: string }) {
    const def = await getDefinitionById(data.definitionId);
    if (!def) throw new HttpError(HTTP_STATUS.NOT_FOUND, 'Workflow definition not found', ERROR_CODES.WORKFLOW.NOT_FOUND);
    if (def.status !== 'active') throw new HttpError(HTTP_STATUS.BAD_REQUEST, 'Definition is not active', ERROR_CODES.WORKFLOW.INVALID_STATE);
    const steps = def.steps as { id: string }[];
    const firstStepId = steps.length ? steps[0].id : null;
    const instance = await prisma.workflowInstance.create({
      data: {
        definitionId: data.definitionId,
        name: data.name,
        status: 'running',
        currentStepId: firstStepId,
        context: (data.context ?? {}) as object,
        priority: data.priority ?? 'normal',
        dueDate: data.dueDate,
        startedBy: data.startedBy,
        startedAt: new Date(),
      },
    });
    if (firstStepId) {
      await prisma.workflowHistory.create({
        data: { instanceId: instance.id, stepId: firstStepId, action: 'started', performedBy: data.startedBy ?? undefined },
      });
    }
    return instance;
  },
  async transition(id: string, data: { action: string; comment?: string; data?: object; performedBy?: string }) {
    const inst = await this.getById(id);
    if (inst.status !== 'running') throw new HttpError(HTTP_STATUS.BAD_REQUEST, 'Instance is not running', ERROR_CODES.WORKFLOW.INVALID_STATE);
    await prisma.workflowHistory.create({
      data: { instanceId: id, stepId: inst.currentStepId ?? 'unknown', action: data.action, payload: (data.data ?? { comment: data.comment }) as object, performedBy: data.performedBy },
    });
    const def = await getDefinitionById(inst.definitionId);
    const steps = (def?.steps ?? []) as { id: string }[];
    const currentIndex = steps.findIndex((s) => s.id === inst.currentStepId);
    const nextStep = currentIndex >= 0 && currentIndex < steps.length - 1 ? steps[currentIndex + 1] : null;
    const isComplete = !nextStep;
    const updated = await prisma.workflowInstance.update({
      where: { id },
      data: {
        currentStepId: nextStep?.id ?? null,
        status: isComplete ? 'completed' : 'running',
        completedAt: isComplete ? new Date() : undefined,
        context: { ...((inst.context as object) || {}), ...(data.data || {}) } as object,
      },
    });
    return updated;
  },
  async cancel(id: string) {
    const inst = await this.getById(id);
    if (inst.status !== 'running' && inst.status !== 'pending') throw new HttpError(HTTP_STATUS.BAD_REQUEST, 'Cannot cancel', ERROR_CODES.WORKFLOW.CANNOT_CANCEL);
    return prisma.workflowInstance.update({ where: { id }, data: { status: 'cancelled', completedAt: new Date() } });
  },
};
