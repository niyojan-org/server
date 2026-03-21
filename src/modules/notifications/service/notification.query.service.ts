import z from "zod";
import * as recipientRepository from "../persistence/recipient.repository";
import {
  GetNotificationsOptions,
  NotificationWithRecipientInfo,
  NotificationStats,
} from "../types/notification.types";
import { uuidSchema } from "@helpers/zod";

export async function getUserNotifications(options: GetNotificationsOptions): Promise<{
  notifications: NotificationWithRecipientInfo[];
  unreadCount: number;
  total: number;
}> {
  const notifications = await recipientRepository.getUserNotifications(options);
  const unreadCount = await recipientRepository.getUnreadCount(options.userId);

  return {
    notifications,
    unreadCount,
    total: notifications.length,
  };
}

export async function getNotificationStats(userId: string): Promise<NotificationStats> {
  const unreadCount = await recipientRepository.getUnreadCount(userId);

  return {
    unreadCount,
    totalCount: unreadCount, // Can be enhanced to get total count if needed
  };
}

export async function markAsRead(userId: string, notificationIds: z.infer<typeof uuidSchema>[]) {
  return recipientRepository.markAsRead(userId, notificationIds);
}

export async function markAllAsRead(userId: string) {
  const updatedCount = await recipientRepository.markAllAsRead(userId);
  return { updatedCount };
}

export async function archiveNotification(userId: string, notificationId: string) {
  return recipientRepository.archiveNotification(userId, notificationId);
}

export async function deleteReadNotifications(userId: string) {
  const deletedCount = await recipientRepository.deleteReadNotifications(userId);
  return { deletedCount };
}

export async function deleteAllNotifications(userId: string) {
  const deletedCount = await recipientRepository.deleteAllNotifications(userId);
  return { deletedCount };
}
