/**
 * Centralized exports for all notification types and schemas
 * This provides a single source of truth for types across the notification system
 */

// Export all enums
export {
  NotificationType,
  NotificationPriority,
  NotificationCategory,
} from './notification.types';

// Export all Zod schemas for notification types
export {
  notificationPayloadSchema,
  notificationDeliveryJobSchema,
  notificationSchema,
  notificationRecipientSchema,
  notificationWithRecipientInfoSchema,
  getNotificationsOptionsSchema,
  notificationStatsSchema,
  createNotificationResultSchema,
} from './notification.types';

// Export all inferred types from notification schemas
export type {
  NotificationPayload,
  NotificationDeliveryJob,
  Notification,
  NotificationRecipient,
  NotificationWithRecipientInfo,
  GetNotificationsOptions,
  NotificationStats,
  CreateNotificationResult,
} from './notification.types';

// Export all Zod schemas for preferences
export {
  userPreferencesSchema,
  channelPreferencesSchema,
  userNotificationPreferencesSchema,
  updatePreferencesPayloadSchema,
  pushTokenSchema,
  registerPushTokenPayloadSchema,
} from './preferences.types';

// Export all inferred types from preference schemas
export type {
  UserPreferences,
  ChannelPreferences,
  UserNotificationPreferences,
  UpdatePreferencesPayload,
  PushToken,
  RegisterPushTokenPayload,
} from './preferences.types';
