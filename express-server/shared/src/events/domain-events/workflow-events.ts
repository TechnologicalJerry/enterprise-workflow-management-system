// ============================================
// Workflow Domain Events
// ============================================

import type { UUID, JSONObject } from '../../types/common.types.js';
import type {
  WorkflowDefinitionStatus,
  WorkflowInstanceStatus,
} from '../../constants/workflow-states.constants.js';

export interface WorkflowDefinitionCreatedPayload {
  name: string;
  version: number;
  category: string;
}

export interface WorkflowDefinitionUpdatedPayload {
  version: number;
  changes: string[];
}

export interface WorkflowDefinitionPublishedPayload {
  version: number;
  publishedBy: UUID;
}

export interface WorkflowDefinitionStatusChangedPayload {
  previousStatus: WorkflowDefinitionStatus;
  newStatus: WorkflowDefinitionStatus;
}

export interface WorkflowInstanceStartedPayload {
  definitionId: UUID;
  definitionVersion: number;
  startedBy: UUID;
  variables: JSONObject;
}

export interface WorkflowInstanceCompletedPayload {
  definitionId: UUID;
  duration: number;
  completedNodes: string[];
  outcome?: string;
}

export interface WorkflowInstanceFailedPayload {
  definitionId: UUID;
  failedNode: string;
  error: string;
}

export interface WorkflowInstanceStatusChangedPayload {
  previousStatus: WorkflowInstanceStatus;
  newStatus: WorkflowInstanceStatus;
  changedBy?: UUID;
  reason?: string;
}

export interface WorkflowNodeCompletedPayload {
  nodeId: string;
  nodeType: string;
  completedBy?: UUID;
  result?: JSONObject;
  duration: number;
}

export const WORKFLOW_EVENT_TYPES = {
  DEFINITION_CREATED: 'WorkflowDefinitionCreated',
  DEFINITION_UPDATED: 'WorkflowDefinitionUpdated',
  DEFINITION_PUBLISHED: 'WorkflowDefinitionPublished',
  DEFINITION_STATUS_CHANGED: 'WorkflowDefinitionStatusChanged',
  INSTANCE_STARTED: 'WorkflowInstanceStarted',
  INSTANCE_COMPLETED: 'WorkflowInstanceCompleted',
  INSTANCE_FAILED: 'WorkflowInstanceFailed',
  INSTANCE_STATUS_CHANGED: 'WorkflowInstanceStatusChanged',
  NODE_COMPLETED: 'WorkflowNodeCompleted',
} as const;

export type WorkflowEventType = (typeof WORKFLOW_EVENT_TYPES)[keyof typeof WORKFLOW_EVENT_TYPES];
