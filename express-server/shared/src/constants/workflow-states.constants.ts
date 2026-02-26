// ============================================
// Workflow State Constants
// ============================================

export const WORKFLOW_DEFINITION_STATUS = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  ARCHIVED: 'archived',
  DEPRECATED: 'deprecated',
} as const;

export type WorkflowDefinitionStatus =
  (typeof WORKFLOW_DEFINITION_STATUS)[keyof typeof WORKFLOW_DEFINITION_STATUS];

export const WORKFLOW_INSTANCE_STATUS = {
  PENDING: 'pending',
  RUNNING: 'running',
  PAUSED: 'paused',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  FAILED: 'failed',
  TERMINATED: 'terminated',
} as const;

export type WorkflowInstanceStatus =
  (typeof WORKFLOW_INSTANCE_STATUS)[keyof typeof WORKFLOW_INSTANCE_STATUS];

export const TASK_STATUS = {
  PENDING: 'pending',
  ASSIGNED: 'assigned',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
  SKIPPED: 'skipped',
  ESCALATED: 'escalated',
} as const;

export type TaskStatus = (typeof TASK_STATUS)[keyof typeof TASK_STATUS];

export const TASK_PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent',
  CRITICAL: 'critical',
} as const;

export type TaskPriority = (typeof TASK_PRIORITY)[keyof typeof TASK_PRIORITY];

export const APPROVAL_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  DELEGATED: 'delegated',
  ESCALATED: 'escalated',
  EXPIRED: 'expired',
} as const;

export type ApprovalStatus = (typeof APPROVAL_STATUS)[keyof typeof APPROVAL_STATUS];

export const APPROVAL_DECISION = {
  APPROVE: 'approve',
  REJECT: 'reject',
  REQUEST_CHANGES: 'request_changes',
  DELEGATE: 'delegate',
  ESCALATE: 'escalate',
} as const;

export type ApprovalDecision = (typeof APPROVAL_DECISION)[keyof typeof APPROVAL_DECISION];

// Valid state transitions
export const WORKFLOW_INSTANCE_TRANSITIONS: Record<
  WorkflowInstanceStatus,
  WorkflowInstanceStatus[]
> = {
  [WORKFLOW_INSTANCE_STATUS.PENDING]: [
    WORKFLOW_INSTANCE_STATUS.RUNNING,
    WORKFLOW_INSTANCE_STATUS.CANCELLED,
  ],
  [WORKFLOW_INSTANCE_STATUS.RUNNING]: [
    WORKFLOW_INSTANCE_STATUS.PAUSED,
    WORKFLOW_INSTANCE_STATUS.COMPLETED,
    WORKFLOW_INSTANCE_STATUS.FAILED,
    WORKFLOW_INSTANCE_STATUS.CANCELLED,
    WORKFLOW_INSTANCE_STATUS.TERMINATED,
  ],
  [WORKFLOW_INSTANCE_STATUS.PAUSED]: [
    WORKFLOW_INSTANCE_STATUS.RUNNING,
    WORKFLOW_INSTANCE_STATUS.CANCELLED,
    WORKFLOW_INSTANCE_STATUS.TERMINATED,
  ],
  [WORKFLOW_INSTANCE_STATUS.COMPLETED]: [],
  [WORKFLOW_INSTANCE_STATUS.CANCELLED]: [],
  [WORKFLOW_INSTANCE_STATUS.FAILED]: [WORKFLOW_INSTANCE_STATUS.RUNNING], // Allow retry
  [WORKFLOW_INSTANCE_STATUS.TERMINATED]: [],
};

export const TASK_TRANSITIONS: Record<TaskStatus, TaskStatus[]> = {
  [TASK_STATUS.PENDING]: [
    TASK_STATUS.ASSIGNED,
    TASK_STATUS.CANCELLED,
    TASK_STATUS.SKIPPED,
  ],
  [TASK_STATUS.ASSIGNED]: [
    TASK_STATUS.IN_PROGRESS,
    TASK_STATUS.CANCELLED,
    TASK_STATUS.SKIPPED,
    TASK_STATUS.PENDING, // Unassign
  ],
  [TASK_STATUS.IN_PROGRESS]: [
    TASK_STATUS.COMPLETED,
    TASK_STATUS.FAILED,
    TASK_STATUS.CANCELLED,
    TASK_STATUS.ESCALATED,
  ],
  [TASK_STATUS.COMPLETED]: [],
  [TASK_STATUS.FAILED]: [TASK_STATUS.IN_PROGRESS], // Allow retry
  [TASK_STATUS.CANCELLED]: [],
  [TASK_STATUS.SKIPPED]: [],
  [TASK_STATUS.ESCALATED]: [
    TASK_STATUS.IN_PROGRESS,
    TASK_STATUS.CANCELLED,
  ],
};
