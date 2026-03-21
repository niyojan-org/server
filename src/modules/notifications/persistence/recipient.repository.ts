import { pool } from "@config/pg";
import {
  NotificationRecipient,
  NotificationWithRecipientInfo,
  GetNotificationsOptions,
} from "../types/notification.types";
import z from "zod";
import { uuidSchema } from "@helpers/zod";

export async function getUserNotifications(
  options: GetNotificationsOptions,
): Promise<NotificationWithRecipientInfo[]> {
  const { userId, limit = 20, offset = 0, unreadOnly = false, category, type } = options;

  let query = `
    SELECT 
      n.*,
      nr.is_read,
      nr.read_at,
      nr.is_archived,
      nr.archived_at
    FROM notifications n
    INNER JOIN notification_recipients nr ON n.id = nr.notification_id
    WHERE nr.user_id = $1
      AND nr.is_archived = FALSE
  `;

  const params: any[] = [userId];
  let paramIndex = 2;

  if (unreadOnly) {
    query += ` AND nr.is_read = FALSE`;
  }

  if (category) {
    query += ` AND n.category = $${paramIndex}`;
    params.push(category);
    paramIndex++;
  }

  if (type) {
    query += ` AND n.type = $${paramIndex}`;
    params.push(type);
    paramIndex++;
  }

  query += ` ORDER BY n.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
  params.push(limit, offset);

  const result = await pool.query<NotificationWithRecipientInfo>(query, params);

  return result.rows;
}

export async function getUnreadCount(userId: string): Promise<number> {
  const result = await pool.query(
    `SELECT COUNT(*) as count 
     FROM notification_recipients 
     WHERE user_id = $1 AND is_read = FALSE AND is_archived = FALSE`,
    [userId],
  );

  return parseInt(result.rows[0].count);
}

export async function markAsRead(
  userId: string,
  notificationIds: z.infer<typeof uuidSchema>[],
): Promise<NotificationRecipient[]> {
  const result = await pool.query<NotificationRecipient>(
    `UPDATE notification_recipients
     SET is_read = TRUE, read_at = NOW(), updated_at = NOW()
     WHERE user_id = $1 AND notification_id = ANY($2) AND is_read = FALSE
     RETURNING *`,
    [userId, notificationIds],
  );

  return result.rows;
}

export async function markAllAsRead(userId: string): Promise<number> {
  const result = await pool.query(
    `UPDATE notification_recipients
     SET is_read = TRUE, read_at = NOW(), updated_at = NOW()
     WHERE user_id = $1 AND is_read = FALSE
     RETURNING *`,
    [userId],
  );

  return result.rowCount || 0;
}

export async function archiveNotification(
  userId: string,
  notificationId: string,
): Promise<NotificationRecipient | null> {
  const result = await pool.query<NotificationRecipient>(
    `UPDATE notification_recipients
     SET is_archived = TRUE, archived_at = NOW(), updated_at = NOW()
     WHERE user_id = $1 AND notification_id = $2
     RETURNING *`,
    [userId, notificationId],
  );

  return result.rows[0] || null;
}

export async function archiveOldReadNotifications(days = 30): Promise<number> {
  const result = await pool.query(
    `UPDATE notification_recipients 
     SET is_archived = TRUE, archived_at = NOW()
     WHERE is_read = TRUE 
       AND read_at < NOW() - INTERVAL '${days} days'
       AND is_archived = FALSE`,
  );

  return result.rowCount || 0;
}

export async function updateDeliveryStatus(
  notificationId: string,
  userId: string,
  channel: "email" | "push",
  success: boolean,
): Promise<void> {
  const field = success ? `${channel}_sent` : `${channel}_failed`;
  const timestampField = success ? `${channel}_sent_at` : null;

  let query = `
    UPDATE notification_recipients
    SET ${field} = TRUE, updated_at = NOW()
  `;

  if (timestampField) {
    query += `, ${timestampField} = NOW()`;
  }

  query += ` WHERE notification_id = $1 AND user_id = $2`;

  await pool.query(query, [notificationId, userId]);
}

// Delete all read notifications for a user
export async function deleteReadNotifications(userId: string): Promise<number> {
  const result = await pool.query(
    `DELETE FROM notification_recipients
     WHERE user_id = $1 AND is_read = TRUE
     RETURNING notification_id`,
    [userId],
  );

  return result.rowCount || 0;
}

// Delete all notifications for a user (clear all)
export async function deleteAllNotifications(userId: string): Promise<number> {
  const result = await pool.query(
    `DELETE FROM notification_recipients
     WHERE user_id = $1
     RETURNING notification_id`,
    [userId],
  );

  return result.rowCount || 0;
}
