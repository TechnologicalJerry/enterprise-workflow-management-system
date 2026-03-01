// ============================================
// Approval Types
// ============================================

import type { AuditableEntity, UUID, Metadata, JSONObject } from './common.types.js';
import type { ApprovalStatus, ApprovalDecision } from '../constants/workflow-states.constants.js';

export interface Approval extends AuditableEntity {
  taskId: UUID;
  workflowInstanceId: UUID;
  title: string;
  description?: string;
  requesterId: UUID;
  approvalChain: ApprovalChainStep[];
  currentStep: number;
  status: ApprovalStatus;
  dueDate?: Date;
  completedAt?: Date;
  metadata: Metadata;
}

export interface ApprovalChainStep {
  step: number;
  type: ApprovalStepType;
  approverId?: UUID;
  approverGroupId?: UUID;
  approverRole?: string;
  status: ApprovalStatus;
  decision?: ApprovalDecision;
  decidedBy?: UUID;
  decidedAt?: Date;
  comments?: string;
  delegatedTo?: UUID;
  delegatedAt?: Date;
}

export type ApprovalStepType = 
  | 'single'      // One approver
  | 'any'         // Any one from group
  | 'all'         // All from group must approve
  | 'majority'    // Majority from group
  | 'sequential'; // Sequential approval chain

export interface ApprovalRequest {
  taskId: UUID;
  title: string;
  description?: string;
  approvalChain: ApprovalChainConfig[];
  dueDate?: Date;
  metadata?: Metadata;
}

export interface ApprovalChainConfig {
  type: ApprovalStepType;
  approverId?: UUID;
  approverGroupId?: UUID;
  approverRole?: string;
}

export interface ApprovalDecisionInput {
  approvalId: UUID;
  decision: ApprovalDecision;
  comments?: string;
  delegateTo?: UUID;
}

export interface ApprovalDelegation {
  approvalId: UUID;
  fromUserId: UUID;
  toUserId: UUID;
  reason: string;
  delegatedAt: Date;
  expiresAt?: Date;
}

export interface ApprovalHistory {
  approvalId: UUID;
  step: number;
  action: ApprovalHistoryAction;
  performedBy: UUID;
  performedAt: Date;
  previousStatus: ApprovalStatus;
  newStatus: ApprovalStatus;
  comments?: string;
  metadata?: JSONObject;
}

export type ApprovalHistoryAction =
  | 'created'
  | 'approved'
  | 'rejected'
  | 'delegated'
  | 'escalated'
  | 'recalled'
  | 'expired';

export interface ApprovalFilter {
  status?: ApprovalStatus[];
  requesterId?: UUID;
  approverId?: UUID;
  workflowInstanceId?: UUID;
  dueBefore?: Date;
  dueAfter?: Date;
  search?: string;
}

export interface PendingApproval {
  approval: Approval;
  step: ApprovalChainStep;
  canApprove: boolean;
  canDelegate: boolean;
}
