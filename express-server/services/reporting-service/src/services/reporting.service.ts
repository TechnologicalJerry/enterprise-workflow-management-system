import { prisma } from '../database/prisma.js';
import axios from 'axios';
import { appConfig } from '../config/app.config.js';
import { HttpError } from '../errors/http.error.js';
import { HTTP_STATUS, ERROR_CODES } from '@workflow/shared';

async function fetchService<T>(baseUrl: string, path: string, correlationId?: string): Promise<T> {
  const { data } = await axios.get<{ success: boolean; data: T }>(`${baseUrl}${path}`, {
    timeout: 10000,
    headers: correlationId ? { 'X-Correlation-ID': correlationId } : {},
  });
  return data.success ? data.data : ([] as unknown as T);
}

export const reportingService = {
  async getDashboard(correlationId?: string) {
    const [instances, tasks, approvals] = await Promise.all([
      fetchService<{ items: unknown[] }>(appConfig.workflowInstanceServiceUrl, '/instances?limit=5', correlationId).then((r) => r.items ?? []),
      fetchService<{ items: unknown[] }>(appConfig.taskServiceUrl, '/tasks?limit=5', correlationId).then((r) => r.items ?? []),
      fetchService<{ items: unknown[] }>(appConfig.approvalServiceUrl, '/approvals?limit=5', correlationId).then((r) => r.items ?? []),
    ]);
    return {
      workflowInstances: instances,
      recentTasks: tasks,
      recentApprovals: approvals,
      summary: {
        totalWorkflowInstances: Array.isArray(instances) ? instances.length : 0,
        totalTasks: Array.isArray(tasks) ? tasks.length : 0,
        totalApprovals: Array.isArray(approvals) ? approvals.length : 0,
      },
    };
  },
  async getWorkflowAnalytics(opts: { startDate?: Date; endDate?: Date }) {
    return { metrics: [], period: { start: opts.startDate, end: opts.endDate } };
  },
  async getTaskAnalytics(opts: { startDate?: Date; endDate?: Date }) {
    return { metrics: [], period: { start: opts.startDate, end: opts.endDate } };
  },
  async getApprovalAnalytics(opts: { startDate?: Date; endDate?: Date }) {
    return { metrics: [], period: { start: opts.startDate, end: opts.endDate } };
  },
  async getUserActivity(opts: { startDate?: Date; endDate?: Date }) {
    return { activities: [], period: { start: opts.startDate, end: opts.endDate } };
  },
  async generateReport(data: { type: string; filters?: object; format?: string; requestedBy?: string }) {
    const job = await prisma.reportJob.create({
      data: {
        type: data.type,
        filters: (data.filters ?? {}) as object,
        status: 'pending',
        requestedBy: data.requestedBy,
      },
    });
    return { id: job.id, status: 'pending', message: 'Report generation started' };
  },
  async getReport(id: string) {
    const job = await prisma.reportJob.findUnique({ where: { id } });
    if (!job) throw new HttpError(HTTP_STATUS.NOT_FOUND, 'Report not found', ERROR_CODES.GENERAL.NOT_FOUND);
    return job;
  },
  async listScheduled() {
    return prisma.reportJob.findMany({ where: { status: 'pending' }, orderBy: { createdAt: 'desc' } });
  },
  async cancelScheduled(id: string) {
    const job = await prisma.reportJob.findUnique({ where: { id } });
    if (!job) throw new HttpError(HTTP_STATUS.NOT_FOUND, 'Report not found', ERROR_CODES.GENERAL.NOT_FOUND);
    if (job.status !== 'pending') throw new HttpError(HTTP_STATUS.BAD_REQUEST, 'Cannot cancel', ERROR_CODES.GENERAL.BAD_REQUEST);
    await prisma.reportJob.update({ where: { id }, data: { status: 'cancelled' } });
    return { id, status: 'cancelled' };
  },
};
