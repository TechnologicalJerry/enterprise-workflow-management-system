// ============================================
// Workflow API Contract v1
// ============================================

import { z } from 'zod';
import { UUIDv4Schema } from '../../../validators/uuid.validator.js';
import { PaginationQuerySchema } from '../../../dto/pagination.dto.js';
import {
  WORKFLOW_DEFINITION_STATUS,
  WORKFLOW_INSTANCE_STATUS,
} from '../../../constants/workflow-states.constants.js';

const WorkflowDefinitionStatusSchema = z.enum([
  WORKFLOW_DEFINITION_STATUS.DRAFT,
  WORKFLOW_DEFINITION_STATUS.PUBLISHED,
  WORKFLOW_DEFINITION_STATUS.ARCHIVED,
  WORKFLOW_DEFINITION_STATUS.DEPRECATED,
]);

const WorkflowInstanceStatusSchema = z.enum([
  WORKFLOW_INSTANCE_STATUS.PENDING,
  WORKFLOW_INSTANCE_STATUS.RUNNING,
  WORKFLOW_INSTANCE_STATUS.PAUSED,
  WORKFLOW_INSTANCE_STATUS.COMPLETED,
  WORKFLOW_INSTANCE_STATUS.CANCELLED,
  WORKFLOW_INSTANCE_STATUS.FAILED,
  WORKFLOW_INSTANCE_STATUS.TERMINATED,
]);

/**
 * Create workflow definition request schema
 */
export const CreateWorkflowDefinitionSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  category: z.string().min(1).max(100),
  tags: z.array(z.string().max(50)).max(20).optional(),
  schema: z.object({
    nodes: z.array(z.object({
      id: z.string(),
      type: z.string(),
      name: z.string(),
      description: z.string().optional(),
      position: z.object({ x: z.number(), y: z.number() }),
      config: z.record(z.unknown()),
    })),
    edges: z.array(z.object({
      id: z.string(),
      source: z.string(),
      target: z.string(),
      condition: z.object({
        type: z.enum(['expression', 'script']),
        value: z.string(),
      }).optional(),
      label: z.string().optional(),
    })),
    variables: z.array(z.object({
      name: z.string(),
      type: z.enum(['string', 'number', 'boolean', 'date', 'object', 'array']),
      defaultValue: z.unknown().optional(),
      required: z.boolean(),
      description: z.string().optional(),
    })).optional(),
  }),
});

export type CreateWorkflowDefinition = z.infer<typeof CreateWorkflowDefinitionSchema>;

/**
 * Update workflow definition schema
 */
export const UpdateWorkflowDefinitionSchema = CreateWorkflowDefinitionSchema.partial();

export type UpdateWorkflowDefinition = z.infer<typeof UpdateWorkflowDefinitionSchema>;

/**
 * Workflow definition query parameters
 */
export const WorkflowDefinitionQuerySchema = PaginationQuerySchema.extend({
  status: z.union([WorkflowDefinitionStatusSchema, z.array(WorkflowDefinitionStatusSchema)]).optional(),
  category: z.string().optional(),
  tags: z.string().optional(), // comma-separated
  search: z.string().optional(),
});

export type WorkflowDefinitionQuery = z.infer<typeof WorkflowDefinitionQuerySchema>;

/**
 * Start workflow instance request schema
 */
export const StartWorkflowInstanceSchema = z.object({
  definitionId: UUIDv4Schema,
  name: z.string().max(200).optional(),
  variables: z.record(z.unknown()).optional(),
  dueDate: z.string().datetime().optional(),
  metadata: z.record(z.unknown()).optional(),
});

export type StartWorkflowInstance = z.infer<typeof StartWorkflowInstanceSchema>;

/**
 * Workflow instance query parameters
 */
export const WorkflowInstanceQuerySchema = PaginationQuerySchema.extend({
  status: z.union([WorkflowInstanceStatusSchema, z.array(WorkflowInstanceStatusSchema)]).optional(),
  definitionId: UUIDv4Schema.optional(),
  startedBy: UUIDv4Schema.optional(),
  startedAfter: z.string().datetime().optional(),
  startedBefore: z.string().datetime().optional(),
  search: z.string().optional(),
});

export type WorkflowInstanceQuery = z.infer<typeof WorkflowInstanceQuerySchema>;

/**
 * Workflow action schema (pause, resume, cancel)
 */
export const WorkflowActionSchema = z.object({
  action: z.enum(['pause', 'resume', 'cancel', 'terminate']),
  reason: z.string().max(500).optional(),
});

export type WorkflowAction = z.infer<typeof WorkflowActionSchema>;
