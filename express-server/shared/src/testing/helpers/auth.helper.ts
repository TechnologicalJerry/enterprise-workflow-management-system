// ============================================
// Auth Test Helpers
// ============================================

import type { AuthenticatedUser, JwtAccessPayload, TokenPair } from '../../types/auth.types.js';
import type { UUID } from '../../types/common.types.js';
import type { Role, Permission } from '../../constants/permissions.constants.js';
import { ROLES, ROLE_PERMISSIONS } from '../../constants/permissions.constants.js';
import { generateUUID } from '../../utils/crypto.util.js';

/**
 * Creates a mock authenticated user
 */
export function createMockAuthenticatedUser(overrides: Partial<AuthenticatedUser> = {}): AuthenticatedUser {
  const id = overrides.id ?? generateUUID();
  const roles = overrides.roles ?? [ROLES.USER];
  const permissions = overrides.permissions ?? getPermissionsForRoles(roles);

  return {
    id,
    email: `user-${id.slice(0, 8)}@example.com`,
    roles,
    permissions,
    sessionId: generateUUID(),
    ...overrides,
  };
}

/**
 * Creates a mock JWT access payload
 */
export function createMockJwtPayload(overrides: Partial<JwtAccessPayload> = {}): JwtAccessPayload {
  const now = Math.floor(Date.now() / 1000);
  const roles = overrides.roles ?? [ROLES.USER];
  
  return {
    sub: overrides.sub ?? generateUUID(),
    email: overrides.email ?? 'test@example.com',
    roles,
    permissions: overrides.permissions ?? getPermissionsForRoles(roles),
    sessionId: overrides.sessionId ?? generateUUID(),
    iat: now,
    exp: now + 900, // 15 minutes
    iss: 'workflow-system',
    aud: 'workflow-api',
    ...overrides,
  };
}

/**
 * Creates a mock token pair
 */
export function createMockTokenPair(): TokenPair {
  return {
    accessToken: 'mock-access-token-' + generateUUID(),
    refreshToken: 'mock-refresh-token-' + generateUUID(),
    expiresIn: 900,
    tokenType: 'Bearer',
  };
}

/**
 * Gets all permissions for given roles
 */
export function getPermissionsForRoles(roles: Role[]): Permission[] {
  const permissions = new Set<Permission>();
  
  for (const role of roles) {
    const rolePermissions = ROLE_PERMISSIONS[role] ?? [];
    for (const permission of rolePermissions) {
      permissions.add(permission);
    }
  }
  
  return Array.from(permissions);
}

/**
 * Creates an authorization header
 */
export function createAuthHeader(token: string): Record<string, string> {
  return {
    Authorization: `Bearer ${token}`,
  };
}

/**
 * Test user fixtures for different roles
 */
export const testAuthUsers = {
  admin: createMockAuthenticatedUser({
    id: '00000000-0000-0000-0000-000000000001' as UUID,
    email: 'admin@example.com',
    roles: [ROLES.ADMIN],
    permissions: ROLE_PERMISSIONS[ROLES.ADMIN],
  }),
  manager: createMockAuthenticatedUser({
    id: '00000000-0000-0000-0000-000000000002' as UUID,
    email: 'manager@example.com',
    roles: [ROLES.MANAGER],
    permissions: ROLE_PERMISSIONS[ROLES.MANAGER],
  }),
  user: createMockAuthenticatedUser({
    id: '00000000-0000-0000-0000-000000000003' as UUID,
    email: 'user@example.com',
    roles: [ROLES.USER],
    permissions: ROLE_PERMISSIONS[ROLES.USER],
  }),
  viewer: createMockAuthenticatedUser({
    id: '00000000-0000-0000-0000-000000000004' as UUID,
    email: 'viewer@example.com',
    roles: [ROLES.VIEWER],
    permissions: ROLE_PERMISSIONS[ROLES.VIEWER],
  }),
};
