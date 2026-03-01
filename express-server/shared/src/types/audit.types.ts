// ============================================
// Audit Types
// ============================================

import type { UUID, Timestamp, JSONObject, Metadata } from './common.types.js';

export interface AuditLog {
  id: UUID;
  timestamp: Timestamp;
  correlationId: string;
  serviceName: string;
  action: AuditAction;
  category: AuditCategory;
  severity: AuditSeverity;
  actorId?: UUID;
  actorType: ActorType;
  actorIp?: string;
  actorUserAgent?: string;
  resourceType: string;
  resourceId?: UUID;
  resourceName?: string;
  description: string;
  oldValue?: JSONObject;
  newValue?: JSONObject;
  changes?: AuditChange[];
  result: AuditResult;
  errorMessage?: string;
  duration?: number;
  metadata: Metadata;
}

export type AuditAction =
  | 'create'
  | 'read'
  | 'update'
  | 'delete'
  | 'login'
  | 'logout'
  | 'access'
  | 'export'
  | 'import'
  | 'approve'
  | 'reject'
  | 'assign'
  | 'start'
  | 'complete'
  | 'cancel'
  | 'escalate'
  | 'delegate'
  | 'upload'
  | 'download'
  | 'share'
  | 'revoke'
  | 'configure'
  | 'execute';

export type AuditCategory =
  | 'authentication'
  | 'authorization'
  | 'user_management'
  | 'workflow'
  | 'task'
  | 'approval'
  | 'document'
  | 'notification'
  | 'system'
  | 'security'
  | 'data_access'
  | 'configuration';

export type AuditSeverity = 'low' | 'medium' | 'high' | 'critical';

export type ActorType = 'user' | 'system' | 'service' | 'api_key' | 'webhook' | 'scheduler';

export type AuditResult = 'success' | 'failure' | 'partial' | 'denied';

export interface AuditChange {
  field: string;
  oldValue: unknown;
  newValue: unknown;
}

export interface CreateAuditLogInput {
  correlationId: string;
  serviceName: string;
  action: AuditAction;
  category: AuditCategory;
  severity?: AuditSeverity;
  actorId?: UUID;
  actorType: ActorType;
  actorIp?: string;
  actorUserAgent?: string;
  resourceType: string;
  resourceId?: UUID;
  resourceName?: string;
  description: string;
  oldValue?: JSONObject;
  newValue?: JSONObject;
  result: AuditResult;
  errorMessage?: string;
  duration?: number;
  metadata?: Metadata;
}

export interface AuditLogFilter {
  action?: AuditAction[];
  category?: AuditCategory[];
  severity?: AuditSeverity[];
  actorId?: UUID;
  actorType?: ActorType[];
  resourceType?: string;
  resourceId?: UUID;
  result?: AuditResult[];
  correlationId?: string;
  startDate?: Timestamp;
  endDate?: Timestamp;
  search?: string;
}

export interface AuditLogExportRequest {
  filter: AuditLogFilter;
  format: 'csv' | 'json' | 'pdf';
  includeMetadata?: boolean;
}

export interface AuditStats {
  totalLogs: number;
  byAction: Record<AuditAction, number>;
  byCategory: Record<AuditCategory, number>;
  bySeverity: Record<AuditSeverity, number>;
  byResult: Record<AuditResult, number>;
  timeRange: {
    start: Timestamp;
    end: Timestamp;
  };
}

export interface ComplianceReport {
  id: UUID;
  name: string;
  type: ComplianceReportType;
  generatedAt: Timestamp;
  generatedBy: UUID;
  period: {
    start: Timestamp;
    end: Timestamp;
  };
  summary: JSONObject;
  findings: ComplianceFinding[];
  status: 'compliant' | 'non_compliant' | 'partial';
}

export type ComplianceReportType =
  | 'access_review'
  | 'permission_audit'
  | 'activity_summary'
  | 'security_events'
  | 'data_retention'
  | 'custom';

export interface ComplianceFinding {
  id: string;
  severity: AuditSeverity;
  category: string;
  description: string;
  recommendation: string;
  affectedResources: string[];
}
