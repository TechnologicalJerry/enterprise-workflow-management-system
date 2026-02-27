// ============================================
// Notification Integration Events
// ============================================

import type { UUID, JSONObject } from '../../types/common.types.js';
import type { NotificationType, NotificationChannel, NotificationPriority } from '../../types/notification.types.js';

export interface SendNotificationEventPayload {
  userId: UUID;
  type: NotificationType;
  channels: NotificationChannel[];
  title: string;
  body: string;
  data?: JSONObject;
  priority: NotificationPriority;
  templateId?: string;
  templateVariables?: Record<string, string>;
  scheduledFor?: string;
  expiresAt?: string;
}

export interface SendBulkNotificationEventPayload {
  userIds: UUID[];
  type: NotificationType;
  channels: NotificationChannel[];
  title: string;
  body: string;
  data?: JSONObject;
  priority: NotificationPriority;
}

export interface NotificationDeliveredEventPayload {
  notificationId: UUID;
  userId: UUID;
  channel: NotificationChannel;
  deliveredAt: string;
}

export interface NotificationFailedEventPayload {
  notificationId: UUID;
  userId: UUID;
  channel: NotificationChannel;
  error: string;
  retryCount: number;
  willRetry: boolean;
}

export interface WebhookDeliveryEventPayload {
  webhookId: UUID;
  event: NotificationType;
  url: string;
  statusCode?: number;
  success: boolean;
  error?: string;
  retryCount: number;
}

export const NOTIFICATION_EVENT_TYPES = {
  SEND_NOTIFICATION: 'SendNotification',
  SEND_BULK_NOTIFICATION: 'SendBulkNotification',
  NOTIFICATION_DELIVERED: 'NotificationDelivered',
  NOTIFICATION_FAILED: 'NotificationFailed',
  WEBHOOK_DELIVERY: 'WebhookDelivery',
} as const;

export type NotificationEventType = (typeof NOTIFICATION_EVENT_TYPES)[keyof typeof NOTIFICATION_EVENT_TYPES];
