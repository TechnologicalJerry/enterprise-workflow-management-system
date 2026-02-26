// ============================================
// Redis Key Constants
// ============================================

export const REDIS_KEYS = {
  // Session & Token
  SESSION: (userId: string) => `session:${userId}`,
  REFRESH_TOKEN: (tokenId: string) => `refresh_token:${tokenId}`,
  TOKEN_BLACKLIST: (tokenId: string) => `blacklist:${tokenId}`,
  ACTIVE_SESSIONS: (userId: string) => `active_sessions:${userId}`,

  // Rate Limiting
  RATE_LIMIT: (identifier: string) => `rate_limit:${identifier}`,
  LOGIN_ATTEMPTS: (email: string) => `login_attempts:${email}`,

  // Caching
  USER_CACHE: (userId: string) => `cache:user:${userId}`,
  USER_PERMISSIONS_CACHE: (userId: string) => `cache:user_permissions:${userId}`,
  ROLE_CACHE: (roleId: string) => `cache:role:${roleId}`,
  WORKFLOW_DEFINITION_CACHE: (workflowId: string) => `cache:workflow_def:${workflowId}`,
  
  // Workflow State
  WORKFLOW_INSTANCE_STATE: (instanceId: string) => `workflow_state:${instanceId}`,
  WORKFLOW_LOCK: (instanceId: string) => `workflow_lock:${instanceId}`,

  // Task Management
  TASK_ASSIGNMENT_LOCK: (taskId: string) => `task_lock:${taskId}`,
  USER_TASKS: (userId: string) => `user_tasks:${userId}`,

  // Approval Chain
  APPROVAL_CHAIN_STATE: (approvalId: string) => `approval_chain:${approvalId}`,

  // Service Health
  SERVICE_HEALTH: (serviceName: string) => `health:${serviceName}`,

  // Idempotency
  IDEMPOTENCY_KEY: (key: string) => `idempotency:${key}`,

  // Distributed Locks
  DISTRIBUTED_LOCK: (resource: string) => `lock:${resource}`,

  // Pub/Sub Channels
  CHANNEL_NOTIFICATIONS: 'channel:notifications',
  CHANNEL_WORKFLOW_UPDATES: 'channel:workflow_updates',
  CHANNEL_TASK_UPDATES: 'channel:task_updates',
} as const;

export const REDIS_TTL = {
  SESSION: 24 * 60 * 60, // 24 hours
  REFRESH_TOKEN: 7 * 24 * 60 * 60, // 7 days
  TOKEN_BLACKLIST: 24 * 60 * 60, // 24 hours
  CACHE_SHORT: 5 * 60, // 5 minutes
  CACHE_MEDIUM: 30 * 60, // 30 minutes
  CACHE_LONG: 60 * 60, // 1 hour
  RATE_LIMIT_WINDOW: 15 * 60, // 15 minutes
  LOGIN_ATTEMPTS: 15 * 60, // 15 minutes
  IDEMPOTENCY: 24 * 60 * 60, // 24 hours
  DISTRIBUTED_LOCK: 30, // 30 seconds
} as const;
