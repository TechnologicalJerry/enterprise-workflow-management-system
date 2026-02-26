// ============================================
// Kafka Topic Constants
// ============================================

export const KAFKA_TOPICS = {
  // User Events
  USER_CREATED: 'user.created',
  USER_UPDATED: 'user.updated',
  USER_DELETED: 'user.deleted',
  USER_ACTIVATED: 'user.activated',
  USER_DEACTIVATED: 'user.deactivated',

  // Authentication Events
  AUTH_LOGIN: 'auth.login',
  AUTH_LOGOUT: 'auth.logout',
  AUTH_TOKEN_REFRESHED: 'auth.token.refreshed',
  AUTH_PASSWORD_CHANGED: 'auth.password.changed',
  AUTH_PASSWORD_RESET_REQUESTED: 'auth.password.reset.requested',
  AUTH_MFA_ENABLED: 'auth.mfa.enabled',
  AUTH_MFA_DISABLED: 'auth.mfa.disabled',

  // Permission Events
  PERMISSION_GRANTED: 'permission.granted',
  PERMISSION_REVOKED: 'permission.revoked',
  ROLE_CREATED: 'role.created',
  ROLE_UPDATED: 'role.updated',
  ROLE_DELETED: 'role.deleted',

  // Workflow Events
  WORKFLOW_DEFINITION_CREATED: 'workflow.definition.created',
  WORKFLOW_DEFINITION_UPDATED: 'workflow.definition.updated',
  WORKFLOW_DEFINITION_PUBLISHED: 'workflow.definition.published',
  WORKFLOW_DEFINITION_ARCHIVED: 'workflow.definition.archived',

  // Workflow Instance Events
  WORKFLOW_INSTANCE_STARTED: 'workflow.instance.started',
  WORKFLOW_INSTANCE_COMPLETED: 'workflow.instance.completed',
  WORKFLOW_INSTANCE_CANCELLED: 'workflow.instance.cancelled',
  WORKFLOW_INSTANCE_PAUSED: 'workflow.instance.paused',
  WORKFLOW_INSTANCE_RESUMED: 'workflow.instance.resumed',
  WORKFLOW_INSTANCE_FAILED: 'workflow.instance.failed',

  // Task Events
  TASK_CREATED: 'task.created',
  TASK_ASSIGNED: 'task.assigned',
  TASK_REASSIGNED: 'task.reassigned',
  TASK_STARTED: 'task.started',
  TASK_COMPLETED: 'task.completed',
  TASK_FAILED: 'task.failed',
  TASK_ESCALATED: 'task.escalated',
  TASK_DEADLINE_APPROACHING: 'task.deadline.approaching',
  TASK_OVERDUE: 'task.overdue',

  // Approval Events
  APPROVAL_REQUESTED: 'approval.requested',
  APPROVAL_APPROVED: 'approval.approved',
  APPROVAL_REJECTED: 'approval.rejected',
  APPROVAL_DELEGATED: 'approval.delegated',
  APPROVAL_ESCALATED: 'approval.escalated',

  // Document Events
  DOCUMENT_UPLOADED: 'document.uploaded',
  DOCUMENT_DOWNLOADED: 'document.downloaded',
  DOCUMENT_DELETED: 'document.deleted',
  DOCUMENT_VERSIONED: 'document.versioned',

  // Notification Events
  NOTIFICATION_EMAIL: 'notification.email',
  NOTIFICATION_SMS: 'notification.sms',
  NOTIFICATION_PUSH: 'notification.push',
  NOTIFICATION_IN_APP: 'notification.in_app',
  NOTIFICATION_WEBHOOK: 'notification.webhook',

  // Audit Events
  AUDIT_LOG: 'audit.log',

  // Dead Letter Queues
  DLQ_USER: 'dlq.user',
  DLQ_WORKFLOW: 'dlq.workflow',
  DLQ_TASK: 'dlq.task',
  DLQ_NOTIFICATION: 'dlq.notification',
} as const;

export type KafkaTopic = (typeof KAFKA_TOPICS)[keyof typeof KAFKA_TOPICS];
