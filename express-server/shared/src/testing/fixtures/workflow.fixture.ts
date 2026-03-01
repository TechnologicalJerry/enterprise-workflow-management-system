// ============================================
// Workflow Test Fixtures
// ============================================

import type { WorkflowDefinition, WorkflowInstance } from '../../types/workflow.types.js';
import { WORKFLOW_DEFINITION_STATUS, WORKFLOW_INSTANCE_STATUS } from '../../constants/workflow-states.constants.js';
import { generateUUID } from '../../utils/crypto.util.js';

export function createWorkflowDefinitionFixture(
  overrides: Partial<WorkflowDefinition> = {}
): WorkflowDefinition {
  const now = new Date().toISOString();
  const id = generateUUID();

  return {
    id,
    name: `Test Workflow ${id.slice(0, 8)}`,
    description: 'A test workflow definition',
    version: 1,
    status: WORKFLOW_DEFINITION_STATUS.DRAFT,
    category: 'general',
    tags: ['test'],
    schema: {
      nodes: [
        {
          id: 'start',
          type: 'start',
          name: 'Start',
          position: { x: 0, y: 0 },
          config: {},
        },
        {
          id: 'task1',
          type: 'task',
          name: 'Task 1',
          position: { x: 200, y: 0 },
          config: {},
        },
        {
          id: 'end',
          type: 'end',
          name: 'End',
          position: { x: 400, y: 0 },
          config: {},
        },
      ],
      edges: [
        { id: 'e1', source: 'start', target: 'task1' },
        { id: 'e2', source: 'task1', target: 'end' },
      ],
      variables: [],
    },
    permissions: {
      startRoles: ['user'],
      viewRoles: ['user', 'manager'],
      adminRoles: ['admin'],
    },
    settings: {},
    metadata: {},
    createdAt: now,
    updatedAt: now,
    createdBy: generateUUID(),
    updatedBy: null,
    ...overrides,
  };
}

export function createWorkflowInstanceFixture(
  overrides: Partial<WorkflowInstance> = {}
): WorkflowInstance {
  const now = new Date().toISOString();
  const id = generateUUID();

  return {
    id,
    definitionId: generateUUID(),
    definitionVersion: 1,
    name: `Instance ${id.slice(0, 8)}`,
    status: WORKFLOW_INSTANCE_STATUS.PENDING,
    startedBy: generateUUID(),
    currentNodes: ['start'],
    variables: {},
    completedNodes: [],
    startedAt: new Date(),
    metadata: {},
    createdAt: now,
    updatedAt: now,
    createdBy: generateUUID(),
    updatedBy: null,
    ...overrides,
  };
}

export function createWorkflowDefinitionFixtures(
  count: number,
  overrides: Partial<WorkflowDefinition> = {}
): WorkflowDefinition[] {
  return Array.from({ length: count }, (_, i) =>
    createWorkflowDefinitionFixture({
      name: `Workflow ${i + 1}`,
      ...overrides,
    })
  );
}

export function createWorkflowInstanceFixtures(
  count: number,
  overrides: Partial<WorkflowInstance> = {}
): WorkflowInstance[] {
  return Array.from({ length: count }, (_, i) =>
    createWorkflowInstanceFixture({
      name: `Instance ${i + 1}`,
      ...overrides,
    })
  );
}
