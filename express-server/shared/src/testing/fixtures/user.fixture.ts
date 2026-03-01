// ============================================
// User Test Fixtures
// ============================================

import type { User, UserPreferences } from '../../types/user.types.js';
import type { UUID } from '../../types/common.types.js';
import { ROLES } from '../../constants/permissions.constants.js';
import { generateUUID } from '../../utils/crypto.util.js';

export const defaultUserPreferences: UserPreferences = {
  language: 'en',
  timezone: 'UTC',
  dateFormat: 'YYYY-MM-DD',
  timeFormat: '24h',
  theme: 'system',
  notifications: {
    email: true,
    push: true,
    sms: false,
    inApp: true,
    taskAssigned: true,
    taskCompleted: true,
    approvalRequired: true,
    workflowCompleted: true,
    systemUpdates: false,
  },
};

export function createUserFixture(overrides: Partial<User> = {}): User {
  const now = new Date().toISOString();
  const id = generateUUID();

  return {
    id,
    email: `user-${id.slice(0, 8)}@example.com`,
    firstName: 'Test',
    lastName: 'User',
    displayName: 'Test User',
    roles: [ROLES.USER],
    status: 'active',
    organizationId: generateUUID(),
    preferences: defaultUserPreferences,
    metadata: {},
    createdAt: now,
    updatedAt: now,
    createdBy: generateUUID(),
    updatedBy: null,
    deletedAt: null,
    isDeleted: false,
    ...overrides,
  };
}

export function createAdminUserFixture(overrides: Partial<User> = {}): User {
  return createUserFixture({
    roles: [ROLES.ADMIN],
    ...overrides,
  });
}

export function createUserFixtures(count: number, overrides: Partial<User> = {}): User[] {
  return Array.from({ length: count }, (_, i) =>
    createUserFixture({
      firstName: `User${i + 1}`,
      ...overrides,
    })
  );
}

export const testUsers = {
  admin: createAdminUserFixture({
    id: '00000000-0000-0000-0000-000000000001' as UUID,
    email: 'admin@example.com',
    firstName: 'Admin',
    lastName: 'User',
    displayName: 'Admin User',
    roles: [ROLES.ADMIN],
  }),
  manager: createUserFixture({
    id: '00000000-0000-0000-0000-000000000002' as UUID,
    email: 'manager@example.com',
    firstName: 'Manager',
    lastName: 'User',
    displayName: 'Manager User',
    roles: [ROLES.MANAGER],
  }),
  regularUser: createUserFixture({
    id: '00000000-0000-0000-0000-000000000003' as UUID,
    email: 'user@example.com',
    firstName: 'Regular',
    lastName: 'User',
    displayName: 'Regular User',
    roles: [ROLES.USER],
  }),
};
