// ============================================
// Task API Contract v1
// ============================================

import { z } from 'zod';
import { UUIDv4Schema } from '../../../validators/uuid.validator.js';
import { PaginationQuerySchema } from '../../../dto/pagination.dto.js';
import { TASK_STATUS, TASK_PRIORITY } from '../../../constants/workflow-states.constants.js';

const TaskStatusSchema = z.enum([
  TASK_STATUS.PENDING,
  TASK_STATUS.ASSIGNED,
  TASK_STATUS.IN_PROGRESS,
  TASK_STATUS.COMPLETED,
  TASK_STATUS.FAILED,
  TASK_STATUS.CANCELLED,
  TASK_STATUS.SKIPPED,
  TASK_STATUS.ESCALATED,
]);

const TaskPrioritySchema = z.enum([
  TASK_PRIORITY.LOW,
  TASK_PRIORITY.MEDIUM,
  TASK_PRIORITY.HIGH,
  TASK_PRIORITY.URGENT,
  TASK_PRIORITY.CRITICAL,
]);

const TaskTypeSchema = z.enum([
  'user_task',
  'approval_task',
  'review_task',
  'form_task',
  'document_task',
  'notification_task',
]);

/**
 * Task query parameters schema
 */
export const TaskQuerySchema = PaginationQuerySchema.extend({
  status: z.union([TaskStatusSchema, z.array(TaskStatusSchema)]).optional(),
  priority: z.union([TaskPrioritySchema, z.array(TaskPrioritySchema)]).optional(),
  type: z.union([TaskTypeSchema, z.array(TaskTypeSchema)]).optional(),
  assigneeId: UUIDv4Schema.optional(),
  workflowInstanceId: UUIDv4Schema.optional(),
  dueBefore: z.string().datetime().optional(),
  dueAfter: z.string().datetime().optional(),
  overdue: z.enum(['true', 'false']).optional().transform(v => v === 'true'),
  search: z.string().optional(),
});

export type TaskQuery = z.infer<typeof TaskQuerySchema>;

/**
 * Assign task request schema
 */
export const AssignTaskSchema = z.object({
  assigneeId: UUIDv4Schema,
  reason: z.string().max(500).optional(),
});

export type AssignTask = z.infer<typeof AssignTaskSchema>;

/**
 * Complete task request schema
 */
export const CompleteTaskSchema = z.object({
  outcome: z.string().min(1).max(100),
  formData: z.record(z.unknown()).optional(),
  comments: z.string().max(2000).optional(),
});

export type CompleteTask = z.infer<typeof CompleteTaskSchema>;

/**
 * Update task request schema
 */
export const UpdateTaskSchema = z.object({
  priority: TaskPrioritySchema.optional(),
  dueDate: z.string().datetime().optional().nullable(),
  formData: z.record(z.unknown()).optional(),
});

export type UpdateTask = z.infer<typeof UpdateTaskSchema>;

/**
 * Escalate task request schema
 */
export const EscalateTaskSchema = z.object({
  escalateTo: UUIDv4Schema,
  reason: z.string().min(1).max(500),
});

export type EscalateTask = z.infer<typeof EscalateTaskSchema>;

/**
 * Task response schema
 */
export const TaskResponseSchema = z.object({
  id: z.string().uuid(),
  workflowInstanceId: z.string().uuid(),
  nodeId: z.string(),
  name: z.string(),
  description: z.string().optional(),
  type: TaskTypeSchema,
  status: TaskStatusSchema,
  priority: TaskPrioritySchema,
  assigneeId: z.string().uuid().optional(),
  dueDate: z.string().optional(),
  startedAt: z.string().optional(),
  completedAt: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type TaskResponse = z.infer<typeof TaskResponseSchema>;
