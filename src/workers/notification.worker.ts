import { Worker } from "bullmq";
import env from "@config/env";
import logger from "@config/logger";
import * as notificationRepository from "@modules/notifications/persistence/notification.repository";
import * as recipientRepository from "@modules/notifications/persistence/recipient.repository";
import * as preferencesService from "@modules/notifications/service/preferences.service";
import pushQueue from "@queues/push.queue";
import { emitNotificationToUser } from "@infra/websocket/socket.handler";

const notificationWorker = new Worker(
  "notifications",
  async (job) => {
    const { notificationId, recipientId, type, channels } = job.data;

    logger.info(`Processing notification ${notificationId} for user ${recipientId}`);

    // 1. Fetch notification details
    const notification = await notificationRepository.getNotificationById(notificationId);

    if (!notification) {
      throw new Error(`Notification ${notificationId} not found`);
    }

    // 2. Check user preferences
    const preferences = await preferencesService.checkUserPreferences(recipientId, type);

    // 3. Check quiet hours (only for non-urgent notifications)
    const isQuietHours =
      notification.priority !== "urgent" && (await preferencesService.isInQuietHours(recipientId));

    // 4. Deliver via each channel
    const deliveryPromises: Promise<any>[] = [];

    // WebSocket (realtime in-app) - always try to deliver if websocket channel is enabled
    // Ignore user preferences for in-app because they control this in the UI
    if (channels.includes("websocket")) {
      deliveryPromises.push(
        emitNotificationToUser(recipientId, {
          id: notificationId,
          type: notification.type,
          title: notification.title,
          message: notification.message,
          data: notification.data,
          action_url: notification.action_url,
          action_label: notification.action_label,
          priority: notification.priority,
          category: notification.category,
          created_at: notification.created_at,
        }).catch((err) => {
          logger.debug("WebSocket delivery failed (user likely offline):", err);
        }),
      );
    }

    // Push - skip if in quiet hours (unless urgent)
    if (channels.includes("push") && preferences.push && !isQuietHours) {
      deliveryPromises.push(
        pushQueue
          .add("send", {
            userId: recipientId,
            notificationId,
            title: notification.title,
            body: notification.message,
            data: {
              notificationId,
              type: notification.type,
              actionUrl: notification.action_url || "",
            },
          })
          .then(() => {
            return recipientRepository.updateDeliveryStatus(
              notificationId,
              recipientId,
              "push",
              true,
            );
          })
          .catch((err) => {
            logger.error("Push queue failed:", err);
            return recipientRepository.updateDeliveryStatus(
              notificationId,
              recipientId,
              "push",
              false,
            );
          }),
      );
    }

    await Promise.allSettled(deliveryPromises);

    logger.info(`Notification ${notificationId} delivered to user ${recipientId}`);
  },
  {
    concurrency: 10,
    connection: {
      host: env.REDIS_HOST,
      port: env.REDIS_PORT,
    },
  },
);

notificationWorker.on("completed", (job) => {
  logger.info(`Notification job ${job.id} completed`);
});

notificationWorker.on("failed", (job, err) => {
  logger.error(`Notification job ${job?.id} failed:`, err);
});

notificationWorker.on("error", (error) => {
  logger.error("Notification worker encountered an error:", error);
});

logger.info("Notification worker started");

export default notificationWorker;
