import { z } from "zod";

// Zod Schemas
export const userPreferencesSchema = z.object({
  push: z.boolean(),
  inApp: z.boolean(),
});

export const channelPreferencesSchema = z.object({
  push: z.boolean(),
  in_app: z.boolean(),
});

export const userNotificationPreferencesSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  push_enabled: z.boolean(),
  in_app_enabled: z.boolean(),
  preferences: z.record(z.string(), channelPreferencesSchema),
  quiet_hours_enabled: z.boolean(),
  quiet_hours_start: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .optional(),
  quiet_hours_end: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .optional(),
  timezone: z.string(),
  updated_at: z.date(),
});

export const updatePreferencesPayloadSchema = z.object({
  push_enabled: z.boolean().optional(),
  in_app_enabled: z.boolean().optional(),
  preferences: z.record(z.string(), channelPreferencesSchema).optional(),
  quiet_hours_enabled: z.boolean().optional(),
  quiet_hours_start: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .optional(),
  quiet_hours_end: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .optional(),
  timezone: z.string().optional(),
});

export const pushTokenSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  token: z.string(),
  device_type: z.enum(["ios", "android", "web"]),
  device_id: z.string().optional(),
  is_active: z.boolean(),
  created_at: z.date(),
  last_used_at: z.date(),
  expires_at: z.date().optional(),
});

export const registerPushTokenPayloadSchema = z.object({
  subscription: z.string().min(1),
  deviceInfo: z
    .object({
      userAgent: z.string().optional(),
      platform: z.string().optional(),
      vendor: z.string().optional(),
    })
    .optional(),
  deviceType: z.enum(["ios", "android", "web"]).optional().default("web"),
});

// Inferred Types
export type UserPreferences = z.infer<typeof userPreferencesSchema>;
export type ChannelPreferences = z.infer<typeof channelPreferencesSchema>;
export type UserNotificationPreferences = z.infer<typeof userNotificationPreferencesSchema>;
export type UpdatePreferencesPayload = z.infer<typeof updatePreferencesPayloadSchema>;
export type PushToken = z.infer<typeof pushTokenSchema>;
export type RegisterPushTokenPayload = z.infer<typeof registerPushTokenPayloadSchema>;
