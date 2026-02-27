// ============================================
// Task Domain Events
// ============================================

import type { UUID, JSONObject } from '../../types/common.types.js';
import type { TaskStatus, TaskPriority } from '../../constants/workflow-states.constants.js';

export interface TaskCreatedPayload {
  workflowInstanceId: UUID;
  nodeId: string;
  name: string;
  type: string;
  assigneeId?: UUID;
  priority: TaskPriority;
  dueDate?: string;
}

export interface TaskAssignedPayload {
  assigneeId: UUID;
  assignedBy: UUID;
  previousAssignee?: UUID;
}

export interface TaskStatusChangedPayload {
  previousStatus: TaskStatus;
  newStatus: TaskStatus;
  changedBy?: UUID;
}

export interface TaskCompletedPayload {
  completedBy: UUID;
  outcome: string;
  formData?: JSONObject;
  duration: number;
}

export interface TaskFailedPayload {
  error: string;
  failedBy?: UUID;
}

export interface TaskEscalatedPayload {
  escalatedTo: UUID;
  escalatedBy: UUID;
  reason: string;
  level: number;
}

export interface TaskDeadlinePayload {
  dueDate: string;
  daysOverdue?: number;
}

export const TASK_EVENT_TYPES = {
  TASK_CREATED: 'TaskCreated',
  TASK_ASSIGNED: 'TaskAssigned',
  TASK_REASSIGNED: 'TaskReassigned',
  TASK_STATUS_CHANGED: 'TaskStatusChanged',
  TASK_COMPLETED: 'TaskCompleted',
  TASK_FAILED: 'TaskFailed',
  TASK_ESCALATED: 'TaskEscalated',
  TASK_DEADLINE_APPROACHING: 'TaskDeadlineApproaching',
  TASK_OVERDUE: 'TaskOverdue',
} as const;

export type TaskEventType = (typeof TASK_EVENT_TYPES)[keyof typeof TASK_EVENT_TYPES];
