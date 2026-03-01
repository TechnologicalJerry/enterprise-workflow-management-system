// ============================================
// Notification Types
// ============================================

import type { BaseEntity, UUID, Metadata, JSONObject } from './common.types.js';

export interface Notification extends BaseEntity {
  userId: UUID;
  type: NotificationType;
  channel: NotificationChannel;
  title: string;
  body: string;
  data?: JSONObject;
  status: NotificationStatus;
  priority: NotificationPriority;
  readAt?: Date;
  sentAt?: Date;
  deliveredAt?: Date;
  failedAt?: Date;
  failureReason?: string;
  retryCount: number;
  expiresAt?: Date;
  metadata: Metadata;
}

export type NotificationType =
  | 'task_assigned'
  | 'task_completed'
  | 'task_overdue'
  | 'approval_required'
  | 'approval_completed'
  | 'approval_rejected'
  | 'workflow_started'
  | 'workflow_completed'
  | 'workflow_failed'
  | 'document_shared'
  | 'mention'
  | 'comment'
  | 'system_alert'
  | 'custom';

export type NotificationChannel = 'email' | 'sms' | 'push' | 'in_app' | 'webhook';

export type NotificationStatus = 'pending' | 'sent' | 'delivered' | 'read' | 'failed' | 'expired';

export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent';

export interface NotificationTemplate {
  id: UUID;
  name: string;
  type: NotificationType;
  channel: NotificationChannel;
  subject?: string;
  bodyTemplate: string;
  htmlTemplate?: string;
  variables: string[];
  isActive: boolean;
  metadata: Metadata;
}

export interface SendNotificationRequest {
  userId: UUID;
  type: NotificationType;
  channels: NotificationChannel[];
  title: string;
  body: string;
  data?: JSONObject;
  priority?: NotificationPriority;
  scheduledFor?: Date;
  expiresAt?: Date;
  metadata?: Metadata;
}

export interface BulkNotificationRequest {
  userIds: UUID[];
  type: NotificationType;
  channels: NotificationChannel[];
  title: string;
  body: string;
  data?: JSONObject;
  priority?: NotificationPriority;
}

export interface NotificationPreferences {
  userId: UUID;
  channels: Record<NotificationChannel, boolean>;
  types: Record<NotificationType, NotificationChannel[]>;
  quietHours?: QuietHours;
  doNotDisturb: boolean;
}

export interface QuietHours {
  enabled: boolean;
  startTime: string; // HH:mm format
  endTime: string;
  timezone: string;
  allowUrgent: boolean;
}

export interface NotificationFilter {
  userId?: UUID;
  type?: NotificationType[];
  channel?: NotificationChannel[];
  status?: NotificationStatus[];
  priority?: NotificationPriority[];
  unreadOnly?: boolean;
  createdAfter?: Date;
  createdBefore?: Date;
}

export interface WebhookConfig {
  id: UUID;
  name: string;
  url: string;
  secret: string;
  events: NotificationType[];
  headers?: Record<string, string>;
  isActive: boolean;
  retryConfig: {
    maxRetries: number;
    retryDelayMs: number;
  };
  metadata: Metadata;
}

export interface WebhookDelivery {
  id: UUID;
  webhookId: UUID;
  event: NotificationType;
  payload: JSONObject;
  status: 'pending' | 'success' | 'failed';
  statusCode?: number;
  responseBody?: string;
  deliveredAt?: Date;
  retryCount: number;
}
