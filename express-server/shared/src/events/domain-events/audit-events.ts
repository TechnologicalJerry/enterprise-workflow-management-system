// ============================================
// Audit Domain Events
// ============================================

import type { UUID, JSONObject } from '../../types/common.types.js';
import type { AuditAction, AuditCategory, ActorType, AuditResult, AuditSeverity } from '../../types/audit.types.js';

export interface AuditEventPayload {
  action: AuditAction;
  category: AuditCategory;
  severity: AuditSeverity;
  actorId?: UUID;
  actorType: ActorType;
  actorIp?: string;
  resourceType: string;
  resourceId?: UUID;
  resourceName?: string;
  description: string;
  oldValue?: JSONObject;
  newValue?: JSONObject;
  result: AuditResult;
  errorMessage?: string;
  duration?: number;
}

export interface SecurityEventPayload extends AuditEventPayload {
  threatLevel: 'low' | 'medium' | 'high' | 'critical';
  securityCategory: SecurityCategory;
  blocked: boolean;
}

export type SecurityCategory =
  | 'authentication'
  | 'authorization'
  | 'data_access'
  | 'configuration'
  | 'suspicious_activity'
  | 'rate_limit'
  | 'injection_attempt';

export const AUDIT_EVENT_TYPES = {
  AUDIT_LOG_CREATED: 'AuditLogCreated',
  SECURITY_EVENT: 'SecurityEvent',
  DATA_ACCESS_EVENT: 'DataAccessEvent',
  CONFIGURATION_CHANGE: 'ConfigurationChange',
} as const;

export type AuditEventType = (typeof AUDIT_EVENT_TYPES)[keyof typeof AUDIT_EVENT_TYPES];
