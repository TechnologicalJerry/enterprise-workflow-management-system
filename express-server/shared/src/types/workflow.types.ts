// ============================================
// Workflow Types
// ============================================

import type { AuditableEntity, UUID, Metadata, JSONObject } from './common.types.js';
import type {
  WorkflowDefinitionStatus,
  WorkflowInstanceStatus,
} from '../constants/workflow-states.constants.js';

// ============================================
// Workflow Definition Types
// ============================================

export interface WorkflowDefinition extends AuditableEntity {
  name: string;
  description: string;
  version: number;
  status: WorkflowDefinitionStatus;
  category: string;
  tags: string[];
  schema: WorkflowSchema;
  permissions: WorkflowPermissions;
  settings: WorkflowSettings;
  metadata: Metadata;
}

export interface WorkflowSchema {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  variables: WorkflowVariable[];
}

export interface WorkflowNode {
  id: string;
  type: WorkflowNodeType;
  name: string;
  description?: string;
  position: { x: number; y: number };
  config: JSONObject;
}

export type WorkflowNodeType =
  | 'start'
  | 'end'
  | 'task'
  | 'approval'
  | 'decision'
  | 'parallel_gateway'
  | 'merge_gateway'
  | 'timer'
  | 'notification'
  | 'script'
  | 'subprocess'
  | 'service_call';

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  condition?: WorkflowCondition;
  label?: string;
}

export interface WorkflowCondition {
  type: 'expression' | 'script';
  value: string;
}

export interface WorkflowVariable {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'date' | 'object' | 'array';
  defaultValue?: unknown;
  required: boolean;
  description?: string;
}

export interface WorkflowPermissions {
  startRoles: string[];
  viewRoles: string[];
  adminRoles: string[];
}

export interface WorkflowSettings {
  timeout?: number; // in minutes
  retryPolicy?: RetryPolicy;
  escalationPolicy?: EscalationPolicy;
  slaConfig?: SlaConfig;
}

export interface RetryPolicy {
  maxRetries: number;
  retryDelayMs: number;
  backoffMultiplier: number;
}

export interface EscalationPolicy {
  enabled: boolean;
  rules: EscalationRule[];
}

export interface EscalationRule {
  triggerAfterMinutes: number;
  escalateTo: UUID[];
  notificationTemplate: string;
}

export interface SlaConfig {
  targetCompletionMinutes: number;
  warningThresholdPercent: number;
}

// ============================================
// Workflow Instance Types
// ============================================

export interface WorkflowInstance extends AuditableEntity {
  definitionId: UUID;
  definitionVersion: number;
  name: string;
  status: WorkflowInstanceStatus;
  startedBy: UUID;
  currentNodes: string[];
  variables: JSONObject;
  completedNodes: CompletedNode[];
  startedAt: Date;
  completedAt?: Date;
  dueDate?: Date;
  metadata: Metadata;
}

export interface CompletedNode {
  nodeId: string;
  completedAt: Date;
  completedBy?: UUID;
  result?: JSONObject;
  duration: number;
}

export interface StartWorkflowInput {
  definitionId: UUID;
  name?: string;
  variables?: JSONObject;
  dueDate?: Date;
  metadata?: Metadata;
}

export interface WorkflowInstanceFilter {
  status?: WorkflowInstanceStatus[];
  definitionId?: UUID;
  startedBy?: UUID;
  startedAfter?: Date;
  startedBefore?: Date;
  search?: string;
}
