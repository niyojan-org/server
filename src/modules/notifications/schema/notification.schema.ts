import { z } from "zod";
import {
  NotificationType,
  NotificationPriority,
  NotificationCategory,
} from "../types/notification.types";
import {
  channelPreferencesSchema,
  registerPushTokenPayloadSchema,
  updatePreferencesPayloadSchema,
} from "../types/preferences.types";

// Re-export from types for convenience
export {
  channelPreferencesSchema,
  registerPushTokenPayloadSchema as registerPushTokenSchema,
  updatePreferencesPayloadSchema as updatePreferencesSchema,
};

// Enum schemas
export const notificationTypeSchema = z.nativeEnum(NotificationType);
export const notificationPrioritySchema = z.nativeEnum(NotificationPriority);
export const notificationCategorySchema = z.nativeEnum(NotificationCategory);

// Create notification schema (for API input validation)
export const createNotificationSchema = z.object({
  type: notificationTypeSchema,
  title: z.string().min(1, "Title is required").max(200, "Title must be less than 200 characters"),
  message: z
    .string()
    .min(1, "Message is required")
    .max(1000, "Message must be less than 1000 characters"),
  recipientIds: z
    .array(z.string().min(1, "Invalid recipient ID"))
    .min(1, "At least one recipient is required")
    .max(1000, "Cannot send to more than 1000 recipients at once"),

  // Optional fields
  data: z.record(z.string(), z.any()).optional(),
  priority: notificationPrioritySchema.optional().default(NotificationPriority.NORMAL),
  category: notificationCategorySchema.optional().default(NotificationCategory.UPDATES),
  actionUrl: z.string().optional(),
  actionLabel: z.string().max(50, "Action label too long").optional(),

  // Actor info
  actorId: z.string().optional(),
  actorType: z.enum(["user", "system", "organization"]).optional(),

  // Channel overrides
  channels: z
    .object({
      push: z.boolean().optional(),
      inApp: z.boolean().optional(),
    })
    .optional(),

  // Expiration
  expiresAt: z.coerce.date().optional(),
});

// Mark as read schema
export const markAsReadSchema = z.object({
  notificationIds: z
    .array(z.string().min(1, "Invalid notification ID"))
    .min(1, "At least one notification ID is required")
    .max(100, "Cannot mark more than 100 notifications at once"),
});

// Query params schema for getting notifications
export const getNotificationsQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  offset: z.coerce.number().int().min(0).optional().default(0),
  unreadOnly: z
    .string()
    .optional()
    .transform((val) => val === "true"),
  category: notificationCategorySchema.optional(),
  type: notificationTypeSchema.optional(),
});

// Export types
export type CreateNotificationInput = z.infer<typeof createNotificationSchema>;
export type MarkAsReadInput = z.infer<typeof markAsReadSchema>;
export type GetNotificationsQuery = z.infer<typeof getNotificationsQuerySchema>;
export type UpdatePreferencesInput = z.infer<typeof updatePreferencesPayloadSchema>;
export type RegisterPushTokenInput = z.infer<typeof registerPushTokenPayloadSchema>;
