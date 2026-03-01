// ============================================
// Task Test Fixtures
// ============================================

import type { Task } from '../../types/task.types.js';
import { TASK_STATUS, TASK_PRIORITY } from '../../constants/workflow-states.constants.js';
import { generateUUID } from '../../utils/crypto.util.js';

export function createTaskFixture(overrides: Partial<Task> = {}): Task {
  const now = new Date().toISOString();
  const id = generateUUID();

  return {
    id,
    workflowInstanceId: generateUUID(),
    nodeId: 'task1',
    name: `Task ${id.slice(0, 8)}`,
    description: 'A test task',
    type: 'user_task',
    status: TASK_STATUS.PENDING,
    priority: TASK_PRIORITY.MEDIUM,
    metadata: {},
    createdAt: now,
    updatedAt: now,
    createdBy: generateUUID(),
    updatedBy: null,
    ...overrides,
  };
}

export function createAssignedTaskFixture(overrides: Partial<Task> = {}): Task {
  return createTaskFixture({
    status: TASK_STATUS.ASSIGNED,
    assigneeId: generateUUID(),
    ...overrides,
  });
}

export function createCompletedTaskFixture(overrides: Partial<Task> = {}): Task {
  return createTaskFixture({
    status: TASK_STATUS.COMPLETED,
    assigneeId: generateUUID(),
    completedAt: new Date(),
    ...overrides,
  });
}

export function createTaskFixtures(count: number, overrides: Partial<Task> = {}): Task[] {
  return Array.from({ length: count }, (_, i) =>
    createTaskFixture({
      name: `Task ${i + 1}`,
      ...overrides,
    })
  );
}

export function createOverdueTaskFixture(overrides: Partial<Task> = {}): Task {
  const pastDate = new Date();
  pastDate.setDate(pastDate.getDate() - 3);

  return createTaskFixture({
    status: TASK_STATUS.ASSIGNED,
    dueDate: pastDate,
    ...overrides,
  });
}
