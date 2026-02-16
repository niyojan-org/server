import { createNotification } from '../service/notification.create.service';
import {
  NotificationType,
  NotificationPriority,
  NotificationCategory,
} from '../types/notification.types';

/**
 * Helper functions to easily send notifications throughout the application
 */

/**
 * Send organization verification notification
 */
export async function notifyOrganizationVerified(
  organizationId: string,
  organizationName: string,
  adminUserId: string
) {
  await createNotification({
    type: NotificationType.ORGANIZATION_VERIFIED,
    title: 'Organization Verified ✅',
    message: `Your organization "${organizationName}" has been successfully verified and is now active.`,
    recipientIds: [adminUserId],
    priority: NotificationPriority.HIGH,
    category: NotificationCategory.UPDATES,
    actionUrl: `/organizations/${organizationId}`,
    actionLabel: 'View Organization',
    actorId: 'system',
    actorType: 'system',
    data: {
      organizationId,
      organizationName,
    },
    channels: {
      push: true,
      inApp: true,
    },
  });
}

/**
 * Send organization rejection notification
 */
export async function notifyOrganizationRejected(
  organizationId: string,
  organizationName: string,
  adminUserId: string,
  reason?: string
) {
  await createNotification({
    type: NotificationType.ORGANIZATION_REJECTED,
    title: 'Organization Verification Rejected',
    message: `Your organization "${organizationName}" verification request has been rejected. ${reason ? `Reason: ${reason}` : 'Please contact support for more information.'}`,
    recipientIds: [adminUserId],
    priority: NotificationPriority.HIGH,
    category: NotificationCategory.ALERTS,
    actionUrl: `/organizations/${organizationId}`,
    actionLabel: 'View Details',
    actorId: 'system',
    actorType: 'system',
    data: {
      organizationId,
      organizationName,
      reason,
    },
    channels: {
      push: true,
      inApp: true,
    },
  });
}

/**
 * Send event reminder notification
 */
export async function notifyEventReminder(
  eventId: string,
  eventName: string,
  eventDate: Date,
  attendeeIds: string[],
  reminderType: 'day_before' | 'hour_before' | 'starting_soon'
) {
  const messages = {
    day_before: `Reminder: "${eventName}" is happening tomorrow!`,
    hour_before: `"${eventName}" starts in 1 hour!`,
    starting_soon: `"${eventName}" is starting soon!`,
  };

  await createNotification({
    type: NotificationType.EVENT_REMINDER,
    title: 'Event Reminder',
    message: messages[reminderType],
    recipientIds: attendeeIds,
    priority: NotificationPriority.HIGH,
    category: NotificationCategory.EVENTS,
    actionUrl: `/events/${eventId}`,
    actionLabel: 'View Event',
    actorId: 'system',
    actorType: 'system',
    data: {
      eventId,
      eventName,
      eventDate: eventDate.toISOString(),
      reminderType,
    },
    channels: {
      push: true,
      inApp: true,
    },
  });
}

/**
 * Send event registration confirmation
 */
export async function notifyEventRegistration(
  eventId: string,
  eventName: string,
  userId: string
) {
  await createNotification({
    type: NotificationType.EVENT_REGISTRATION_CONFIRMED,
    title: 'Event Registration Confirmed',
    message: `You have successfully registered for "${eventName}".`,
    recipientIds: [userId],
    priority: NotificationPriority.NORMAL,
    category: NotificationCategory.EVENTS,
    actionUrl: `/events/${eventId}`,
    actionLabel: 'View Event',
    actorId: 'system',
    actorType: 'system',
    data: {
      eventId,
      eventName,
    },
    channels: {
      push: false,
      inApp: true,
    },
  });
}

/**
 * Send event update notification
 */
export async function notifyEventUpdate(
  eventId: string,
  eventName: string,
  updateMessage: string,
  attendeeIds: string[]
) {
  await createNotification({
    type: NotificationType.EVENT_UPDATED,
    title: 'Event Updated',
    message: `"${eventName}" has been updated: ${updateMessage}`,
    recipientIds: attendeeIds,
    priority: NotificationPriority.HIGH,
    category: NotificationCategory.EVENTS,
    actionUrl: `/events/${eventId}`,
    actionLabel: 'View Changes',
    actorId: 'system',
    actorType: 'system',
    data: {
      eventId,
      eventName,
      updateMessage,
    },
    channels: {
      push: true,
      inApp: true,
    },
  });
}

/**
 * Send event cancellation notification
 */
export async function notifyEventCancelled(
  eventId: string,
  eventName: string,
  attendeeIds: string[],
  reason?: string
) {
  await createNotification({
    type: NotificationType.EVENT_CANCELLED,
    title: 'Event Cancelled',
    message: `"${eventName}" has been cancelled. ${reason ? `Reason: ${reason}` : ''}`,
    recipientIds: attendeeIds,
    priority: NotificationPriority.URGENT,
    category: NotificationCategory.ALERTS,
    actionUrl: `/events/${eventId}`,
    actionLabel: 'View Details',
    actorId: 'system',
    actorType: 'system',
    data: {
      eventId,
      eventName,
      reason,
    },
    channels: {
      push: true,
      inApp: true,
    },
  });
}

/**
 * Send system announcement
 */
export async function notifySystemAnnouncement(
  title: string,
  message: string,
  userIds: string[],
  actionUrl?: string
) {
  await createNotification({
    type: NotificationType.SYSTEM_ANNOUNCEMENT,
    title,
    message,
    recipientIds: userIds,
    priority: NotificationPriority.NORMAL,
    category: NotificationCategory.SYSTEM,
    actionUrl,
    actionLabel: actionUrl ? 'Learn More' : undefined,
    actorId: 'system',
    actorType: 'system',
    channels: {
      push: false,
      inApp: true,
    },
  });
}
