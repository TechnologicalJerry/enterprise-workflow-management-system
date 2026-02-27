// ============================================
// Approval Domain Events
// ============================================

import type { UUID } from '../../types/common.types.js';
import type { ApprovalStatus, ApprovalDecision } from '../../constants/workflow-states.constants.js';

export interface ApprovalRequestedPayload {
  taskId: UUID;
  workflowInstanceId: UUID;
  title: string;
  requesterId: UUID;
  approvers: UUID[];
  dueDate?: string;
}

export interface ApprovalDecisionPayload {
  decision: ApprovalDecision;
  decidedBy: UUID;
  step: number;
  comments?: string;
}

export interface ApprovalStatusChangedPayload {
  previousStatus: ApprovalStatus;
  newStatus: ApprovalStatus;
  changedBy?: UUID;
}

export interface ApprovalDelegatedPayload {
  fromUserId: UUID;
  toUserId: UUID;
  delegatedBy: UUID;
  reason: string;
  step: number;
}

export interface ApprovalEscalatedPayload {
  escalatedTo: UUID[];
  escalatedBy: UUID;
  reason: string;
  step: number;
  level: number;
}

export interface ApprovalCompletedPayload {
  finalDecision: ApprovalDecision;
  completedSteps: number;
  totalSteps: number;
  duration: number;
}

export const APPROVAL_EVENT_TYPES = {
  APPROVAL_REQUESTED: 'ApprovalRequested',
  APPROVAL_APPROVED: 'ApprovalApproved',
  APPROVAL_REJECTED: 'ApprovalRejected',
  APPROVAL_DELEGATED: 'ApprovalDelegated',
  APPROVAL_ESCALATED: 'ApprovalEscalated',
  APPROVAL_STATUS_CHANGED: 'ApprovalStatusChanged',
  APPROVAL_COMPLETED: 'ApprovalCompleted',
} as const;

export type ApprovalEventType = (typeof APPROVAL_EVENT_TYPES)[keyof typeof APPROVAL_EVENT_TYPES];
