// ============================================
// Permission Constants for RBAC
// ============================================

export const PERMISSIONS = {
  // User Management
  USER_CREATE: 'user:create',
  USER_READ: 'user:read',
  USER_UPDATE: 'user:update',
  USER_DELETE: 'user:delete',
  USER_LIST: 'user:list',
  USER_MANAGE_ROLES: 'user:manage_roles',

  // Role Management
  ROLE_CREATE: 'role:create',
  ROLE_READ: 'role:read',
  ROLE_UPDATE: 'role:update',
  ROLE_DELETE: 'role:delete',
  ROLE_LIST: 'role:list',
  ROLE_ASSIGN_PERMISSIONS: 'role:assign_permissions',

  // Workflow Definition
  WORKFLOW_DEF_CREATE: 'workflow_def:create',
  WORKFLOW_DEF_READ: 'workflow_def:read',
  WORKFLOW_DEF_UPDATE: 'workflow_def:update',
  WORKFLOW_DEF_DELETE: 'workflow_def:delete',
  WORKFLOW_DEF_PUBLISH: 'workflow_def:publish',
  WORKFLOW_DEF_ARCHIVE: 'workflow_def:archive',

  // Workflow Instance
  WORKFLOW_INSTANCE_START: 'workflow_instance:start',
  WORKFLOW_INSTANCE_READ: 'workflow_instance:read',
  WORKFLOW_INSTANCE_CANCEL: 'workflow_instance:cancel',
  WORKFLOW_INSTANCE_PAUSE: 'workflow_instance:pause',
  WORKFLOW_INSTANCE_RESUME: 'workflow_instance:resume',

  // Task Management
  TASK_CREATE: 'task:create',
  TASK_READ: 'task:read',
  TASK_UPDATE: 'task:update',
  TASK_ASSIGN: 'task:assign',
  TASK_REASSIGN: 'task:reassign',
  TASK_COMPLETE: 'task:complete',

  // Approval Management
  APPROVAL_CREATE: 'approval:create',
  APPROVAL_READ: 'approval:read',
  APPROVAL_APPROVE: 'approval:approve',
  APPROVAL_REJECT: 'approval:reject',
  APPROVAL_DELEGATE: 'approval:delegate',

  // Document Management
  DOCUMENT_UPLOAD: 'document:upload',
  DOCUMENT_READ: 'document:read',
  DOCUMENT_DOWNLOAD: 'document:download',
  DOCUMENT_DELETE: 'document:delete',
  DOCUMENT_MANAGE: 'document:manage',

  // Audit
  AUDIT_READ: 'audit:read',
  AUDIT_EXPORT: 'audit:export',

  // Reports
  REPORT_VIEW: 'report:view',
  REPORT_CREATE: 'report:create',
  REPORT_EXPORT: 'report:export',
  REPORT_SCHEDULE: 'report:schedule',

  // System Administration
  SYSTEM_SETTINGS: 'system:settings',
  SYSTEM_HEALTH: 'system:health',
  SYSTEM_METRICS: 'system:metrics',
  SYSTEM_LOGS: 'system:logs',
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  MANAGER: 'manager',
  SUPERVISOR: 'supervisor',
  USER: 'user',
  VIEWER: 'viewer',
  EXTERNAL: 'external',
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

// Default role permissions mapping
export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  [ROLES.SUPER_ADMIN]: Object.values(PERMISSIONS),
  [ROLES.ADMIN]: [
    PERMISSIONS.USER_CREATE,
    PERMISSIONS.USER_READ,
    PERMISSIONS.USER_UPDATE,
    PERMISSIONS.USER_DELETE,
    PERMISSIONS.USER_LIST,
    PERMISSIONS.ROLE_READ,
    PERMISSIONS.ROLE_LIST,
    PERMISSIONS.WORKFLOW_DEF_CREATE,
    PERMISSIONS.WORKFLOW_DEF_READ,
    PERMISSIONS.WORKFLOW_DEF_UPDATE,
    PERMISSIONS.WORKFLOW_DEF_PUBLISH,
    PERMISSIONS.WORKFLOW_INSTANCE_START,
    PERMISSIONS.WORKFLOW_INSTANCE_READ,
    PERMISSIONS.WORKFLOW_INSTANCE_CANCEL,
    PERMISSIONS.TASK_CREATE,
    PERMISSIONS.TASK_READ,
    PERMISSIONS.TASK_UPDATE,
    PERMISSIONS.TASK_ASSIGN,
    PERMISSIONS.APPROVAL_READ,
    PERMISSIONS.APPROVAL_APPROVE,
    PERMISSIONS.APPROVAL_REJECT,
    PERMISSIONS.DOCUMENT_UPLOAD,
    PERMISSIONS.DOCUMENT_READ,
    PERMISSIONS.DOCUMENT_DOWNLOAD,
    PERMISSIONS.AUDIT_READ,
    PERMISSIONS.REPORT_VIEW,
    PERMISSIONS.REPORT_CREATE,
  ],
  [ROLES.MANAGER]: [
    PERMISSIONS.USER_READ,
    PERMISSIONS.USER_LIST,
    PERMISSIONS.WORKFLOW_DEF_READ,
    PERMISSIONS.WORKFLOW_INSTANCE_START,
    PERMISSIONS.WORKFLOW_INSTANCE_READ,
    PERMISSIONS.TASK_READ,
    PERMISSIONS.TASK_ASSIGN,
    PERMISSIONS.TASK_REASSIGN,
    PERMISSIONS.APPROVAL_READ,
    PERMISSIONS.APPROVAL_APPROVE,
    PERMISSIONS.APPROVAL_REJECT,
    PERMISSIONS.APPROVAL_DELEGATE,
    PERMISSIONS.DOCUMENT_READ,
    PERMISSIONS.DOCUMENT_DOWNLOAD,
    PERMISSIONS.REPORT_VIEW,
  ],
  [ROLES.SUPERVISOR]: [
    PERMISSIONS.USER_READ,
    PERMISSIONS.WORKFLOW_INSTANCE_READ,
    PERMISSIONS.TASK_READ,
    PERMISSIONS.TASK_ASSIGN,
    PERMISSIONS.APPROVAL_READ,
    PERMISSIONS.APPROVAL_APPROVE,
    PERMISSIONS.APPROVAL_REJECT,
    PERMISSIONS.DOCUMENT_READ,
    PERMISSIONS.DOCUMENT_DOWNLOAD,
  ],
  [ROLES.USER]: [
    PERMISSIONS.WORKFLOW_INSTANCE_START,
    PERMISSIONS.WORKFLOW_INSTANCE_READ,
    PERMISSIONS.TASK_READ,
    PERMISSIONS.TASK_UPDATE,
    PERMISSIONS.TASK_COMPLETE,
    PERMISSIONS.DOCUMENT_UPLOAD,
    PERMISSIONS.DOCUMENT_READ,
    PERMISSIONS.DOCUMENT_DOWNLOAD,
  ],
  [ROLES.VIEWER]: [
    PERMISSIONS.WORKFLOW_INSTANCE_READ,
    PERMISSIONS.TASK_READ,
    PERMISSIONS.DOCUMENT_READ,
  ],
  [ROLES.EXTERNAL]: [
    PERMISSIONS.TASK_READ,
    PERMISSIONS.TASK_COMPLETE,
    PERMISSIONS.DOCUMENT_READ,
    PERMISSIONS.DOCUMENT_DOWNLOAD,
  ],
};
