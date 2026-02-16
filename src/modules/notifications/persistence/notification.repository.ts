import { pool } from "@config/pg";
import {
  Notification,
  NotificationPayload,
  CreateNotificationResult,
} from "../types/notification.types";

export async function createNotification(
  payload: NotificationPayload,
  client = pool,
): Promise<CreateNotificationResult> {
  const useTransaction = client === pool;
  const dbClient = useTransaction ? await pool.connect() : client;
  try {
    if (useTransaction) await dbClient.query("BEGIN");

    // 1. Insert notification
    const notificationResult = await dbClient.query<Notification>(
      `INSERT INTO notifications 
        (type, title, message, data, priority, category, action_url, action_label, actor_id, actor_type, expires_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [
        payload.type,
        payload.title,
        payload.message,
        JSON.stringify(payload.data || {}),
        payload.priority || "normal",
        payload.category || "updates",
        payload.actionUrl,
        payload.actionLabel,
        payload.actorId,
        payload.actorType,
        payload.expiresAt,
      ],
    );

    const notification = notificationResult.rows[0];

    if (!notification) {
      throw new Error("Failed to create notification");
    }

    // 2. Insert recipients
    const recipientValues = payload.recipientIds
      .map((_, idx) => {
        const offset = idx * 2;
        return `($${offset + 1}, $${offset + 2})`;
      })
      .join(", ");

    const recipientParams = payload.recipientIds.flatMap((userId) => [notification.id, userId]);

    const recipientsResult = await dbClient.query(
      `INSERT INTO notification_recipients (notification_id, user_id)
       VALUES ${recipientValues}
       RETURNING *`,
      recipientParams,
    );

    if (useTransaction) await dbClient.query("COMMIT");

    return {
      notification,
      recipientCount: recipientsResult.rowCount || 0,
    };
  } catch (error) {
    if (useTransaction) await dbClient.query("ROLLBACK");
    throw error;
  } finally {
    if (useTransaction && "release" in dbClient) {
      dbClient.release();
    }
  }
}

export async function getNotificationById(notificationId: string): Promise<Notification | null> {
  const result = await pool.query<Notification>("SELECT * FROM notifications WHERE id = $1", [
    notificationId,
  ]);

  return result.rows[0] || null;
}

export async function deleteExpiredNotifications(): Promise<number> {
  const result = await pool.query("DELETE FROM notifications WHERE expires_at < NOW()");

  return result.rowCount || 0;
}
