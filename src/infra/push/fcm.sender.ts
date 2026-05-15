import webPush from 'web-push';
import logger from '@config/logger';
import env from '@config/env';
import * as pushTokenRepository from '@modules/notifications/persistence/push-token.repository';

let isInitialized = false;

export function initializeWebPush() {
  try {
    if (!env.VAPID_PUBLIC_KEY || !env.VAPID_PRIVATE_KEY || !env.VAPID_SUBJECT) {
      logger.warn('Web Push VAPID credentials not configured. Push notifications will be disabled.');
      logger.info('To enable push notifications, set VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, and VAPID_SUBJECT in your .env file');
      return;
    }

    webPush.setVapidDetails(
      env.VAPID_SUBJECT,
      env.VAPID_PUBLIC_KEY,
      env.VAPID_PRIVATE_KEY
    );

    isInitialized = true;
    logger.info('Web Push initialized with VAPID credentials');
  } catch (error) {
    logger.warn('Web Push initialization failed. Push notifications will be disabled.');
    logger.debug('Error initializing Web Push:', error);
  }
}

export interface PushNotificationPayload {
  userId: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  icon?: string;
  badge?: string;
  image?: string;
  url?: string;
}

export async function sendPushNotification(
  payload: PushNotificationPayload
): Promise<{ sent: number; failed: number }> {
  if (!isInitialized) {
    logger.warn('Web Push not initialized. Skipping push notification.');
    return { sent: 0, failed: 0 };
  }

  // 1. Get user's active push tokens (subscriptions)
  const tokenRecords = await pushTokenRepository.getActivePushTokens(
    payload.userId
  );

  if (tokenRecords.length === 0) {
    logger.info(`No push subscriptions found for user ${payload.userId}`);
    return { sent: 0, failed: 0 };
  }

  // 2. Prepare notification payload
  const notificationPayload = JSON.stringify({
    title: payload.title,
    body: payload.body,
    icon: payload.icon || '/logo.png',
    badge: payload.badge || '/badge.png',
    image: payload.image,
    data: payload.data || {},
    url: payload.url,
  });

  // 3. Send to all subscriptions
  let sent = 0;
  let failed = 0;
  const failedTokens: string[] = [];

  const sendPromises = tokenRecords.map(async (record) => {
    try {
      // Parse the subscription object from the stored token
      const subscription = JSON.parse(record.token);
      
      await webPush.sendNotification(subscription, notificationPayload);
      sent++;
    } catch (error: unknown) {
      failed++;
      failedTokens.push(record.token);

      const err = error as { statusCode?: number; message?: string };
      
      // Log specific error
      if (err.statusCode === 410 || err.statusCode === 404) {
        logger.debug(`Push subscription expired or not found: ${record.id}`);
      } else {
        logger.debug(
          `Push notification failed for subscription ${record.id}: ${err.message ?? "Unknown error"}`,
        );
      }
    }
  });

  await Promise.allSettled(sendPromises);

  logger.info(
    `Push notification sent to user ${payload.userId}: ${sent} succeeded, ${failed} failed`
  );

  // 4. Deactivate failed tokens
  if (failedTokens.length > 0) {
    await pushTokenRepository.deactivatePushTokens(failedTokens);
    logger.info(`Deactivated ${failedTokens.length} invalid push subscriptions`);
  }

  return { sent, failed };
}

// Utility function to generate VAPID keys (for initial setup)
export function generateVapidKeys() {
  const vapidKeys = webPush.generateVAPIDKeys();
  logger.info('Generated VAPID keys:');
  logger.info(`Public Key: ${vapidKeys.publicKey}`);
  logger.info(`Private Key: ${vapidKeys.privateKey}`);
  return vapidKeys;
}

// Initialize on module load
initializeWebPush();
