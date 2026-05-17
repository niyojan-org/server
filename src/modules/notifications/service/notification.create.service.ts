import logger from '@config/logger';
import { EventEmitter } from 'events';
import {
  NotificationPayload,
  NotificationDeliveryJob,
  CreateNotificationResult,
} from '../types/notification.types';
import * as notificationRepository from '../persistence/notification.repository';
import notificationQueue from '@queues/notification.queue';

export const notificationEmitter = new EventEmitter();

export async function createNotification(
  payload: NotificationPayload,
): Promise<CreateNotificationResult> {
  try {
    // 1. Save notification to database
    const result = await notificationRepository.createNotification(payload);

    // 2. Queue delivery jobs for each recipient
    for (const recipientId of payload.recipientIds) {
      await queueNotificationDelivery({
        notificationId: result.notification.id,
        recipientId,
        type: payload.type,
        channels: determineChannels(payload),
      });
    }

    // 3. Emit event for realtime listeners
      notificationEmitter.emit('notification:created', {
      notification: result.notification,
      recipientIds: payload.recipientIds,
    });

    logger.info(
      `Notification ${result.notification.id} created for ${result.recipientCount} recipients`,
    );

    return result;
  } catch (error) {
    logger.error('Failed to create notification:', error);
    throw error;
  }
}

function determineChannels(payload: NotificationPayload): ('push' | 'websocket')[] {
  const channels: ('push' | 'websocket')[] = [];

  // Always send websocket for in-app notifications
  if (payload.channels?.inApp !== false) {
    channels.push('websocket');
  }

  // Push notifications
  if (payload.channels?.push !== false) {
    channels.push('push');
  }

  return channels;
}

async function queueNotificationDelivery(job: NotificationDeliveryJob) {
  await notificationQueue.add('deliver', job, {
    jobId: `${job.notificationId}-${job.recipientId}`, // Prevents duplicate processing
    removeOnComplete: true,
    removeOnFail: false,
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
  });
}
