import { z } from 'zod';

// Enums
export enum NotificationType {
  // Organization notifications
  ORGANIZATION_VERIFIED = 'organization_verified',
  ORGANIZATION_REJECTED = 'organization_rejected',
  ORGANIZATION_UPDATED = 'organization_updated',

  // Task notifications
  TASK_ASSIGNED = 'task_assigned',
  TASK_COMMENT = 'task_comment',
  TASK_STATUS_CHANGED = 'task_status_changed',

  // Event notifications
  EVENT_CREATED = 'event_created',
  EVENT_UPDATED = 'event_updated',
  EVENT_CANCELLED = 'event_cancelled',
  EVENT_REMINDER = 'event_reminder',
  EVENT_REGISTRATION_CONFIRMED = 'event_registration',
  EVENT_REGISTRATION_CANCELLED = 'event_registration_cancelled',

  // Social notifications
  MENTION = 'mention',
  COMMENT_REPLY = 'comment_reply',

  // System notifications
  SYSTEM_ANNOUNCEMENT = 'system_announcement',
  SYSTEM_MAINTENANCE = 'system_maintenance',
}

export enum NotificationPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  URGENT = 'urgent',
}

export enum NotificationCategory {
  SYSTEM = 'system',
  SOCIAL = 'social',
  UPDATES = 'updates',
  ALERTS = 'alerts',
  EVENTS = 'events',
}

// Zod Schemas
export const notificationPayloadSchema = z.object({
  type: z.enum(Object.values(NotificationType) as [string, ...string[]]),
  title: z.string().min(1).max(200),
  message: z.string().min(1).max(1000),
  recipientIds: z.array(z.string()).min(1).max(1000),

  // Optional fields
  data: z.record(z.string(), z.any()).optional(),
  priority: z.enum(Object.values(NotificationPriority) as [string, ...string[]]).optional(),
  category: z.enum(Object.values(NotificationCategory) as [string, ...string[]]).optional(),
  actionUrl: z.string().optional(),
  actionLabel: z.string().max(50).optional(),

  // Actor info
  actorId: z.string().optional(),
  actorType: z.enum(['user', 'system', 'organization']).optional(),

  // Channel overrides
  channels: z
    .object({
      push: z.boolean().optional(),
      inApp: z.boolean().optional(),
    })
    .optional(),

  // Expiration
  expiresAt: z.date().optional(),
});

export const notificationDeliveryJobSchema = z.object({
  notificationId: z.string(),
  recipientId: z.string(),
  type: z.string(),
  channels: z.array(z.enum(['push', 'websocket'])),
});

export const notificationSchema = z.object({
  id: z.string(),
  type: z.string(),
  title: z.string(),
  message: z.string(),
  data: z.record(z.string(), z.any()),
  priority: z.string(),
  category: z.string(),
  action_url: z.string().optional(),
  action_label: z.string().optional(),
  created_at: z.date(),
  expires_at: z.date().optional(),
  actor_id: z.string().optional(),
  actor_type: z.string().optional(),
});

export const notificationRecipientSchema = z.object({
  id: z.string(),
  notification_id: z.string(),
  user_id: z.string(),
  is_read: z.boolean(),
  read_at: z.date().optional(),
  is_archived: z.boolean(),
  archived_at: z.date().optional(),
  email_sent: z.boolean(),
  email_sent_at: z.date().optional(),
  email_failed: z.boolean(),
  push_sent: z.boolean(),
  push_sent_at: z.date().optional(),
  push_failed: z.boolean(),
  in_app_delivered: z.boolean(),
  created_at: z.date(),
  updated_at: z.date(),
});

export const notificationWithRecipientInfoSchema = notificationSchema.extend({
  is_read: z.boolean(),
  read_at: z.date().optional(),
  is_archived: z.boolean(),
  archived_at: z.date().optional(),
});

export const getNotificationsOptionsSchema = z.object({
  userId: z.string(),
  limit: z.number().int().positive().optional(),
  offset: z.number().int().min(0).optional(),
  unreadOnly: z.boolean().optional(),
  category: z.string().optional(),
  type: z.string().optional(),
});

export const notificationStatsSchema = z.object({
  unreadCount: z.number().int().min(0),
  totalCount: z.number().int().min(0),
});

export const createNotificationResultSchema = z.object({
  notification: notificationSchema,
  recipientCount: z.number().int().min(0),
});

// Inferred Types
export type NotificationPayload = z.infer<typeof notificationPayloadSchema>;
export type NotificationDeliveryJob = z.infer<typeof notificationDeliveryJobSchema>;
export type Notification = z.infer<typeof notificationSchema>;
export type NotificationRecipient = z.infer<typeof notificationRecipientSchema>;
export type NotificationWithRecipientInfo = z.infer<typeof notificationWithRecipientInfoSchema>;
export type GetNotificationsOptions = z.infer<typeof getNotificationsOptionsSchema>;
export type NotificationStats = z.infer<typeof notificationStatsSchema>;
export type CreateNotificationResult = z.infer<typeof createNotificationResultSchema>;
