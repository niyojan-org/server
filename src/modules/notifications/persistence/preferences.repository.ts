import { pool } from '@config/pg';
import {
  UserNotificationPreferences,
  UpdatePreferencesPayload,
} from '../types/preferences.types';

export async function getUserPreferences(
  userId: string
): Promise<UserNotificationPreferences | null> {
  const result = await pool.query<UserNotificationPreferences>(
    'SELECT * FROM user_notification_preferences WHERE user_id = $1',
    [userId]
  );

  return result.rows[0] || null;
}

export async function createDefaultPreferences(
  userId: string
): Promise<UserNotificationPreferences> {
  const result = await pool.query<UserNotificationPreferences>(
    `INSERT INTO user_notification_preferences (user_id)
     VALUES ($1)
     RETURNING *`,
    [userId]
  );

  if (!result.rows[0]) {
    throw new Error('Failed to create user preferences');
  }

  return result.rows[0];
}

export async function getOrCreateUserPreferences(
  userId: string
): Promise<UserNotificationPreferences> {
  let preferences = await getUserPreferences(userId);

  if (!preferences) {
    preferences = await createDefaultPreferences(userId);
  }

  return preferences;
}

export async function updateUserPreferences(
  userId: string,
  payload: UpdatePreferencesPayload
): Promise<UserNotificationPreferences> {
  const updates: string[] = [];
  const values: unknown[] = [userId];
  let paramIndex = 2;

  if (payload.push_enabled !== undefined) {
    updates.push(`push_enabled = $${paramIndex}`);
    values.push(payload.push_enabled);
    paramIndex++;
  }

  if (payload.in_app_enabled !== undefined) {
    updates.push(`in_app_enabled = $${paramIndex}`);
    values.push(payload.in_app_enabled);
    paramIndex++;
  }

  if (payload.preferences !== undefined) {
    updates.push(`preferences = $${paramIndex}`);
    values.push(JSON.stringify(payload.preferences));
    paramIndex++;
  }

  if (payload.quiet_hours_enabled !== undefined) {
    updates.push(`quiet_hours_enabled = $${paramIndex}`);
    values.push(payload.quiet_hours_enabled);
    paramIndex++;
  }

  if (payload.quiet_hours_start !== undefined) {
    updates.push(`quiet_hours_start = $${paramIndex}`);
    values.push(payload.quiet_hours_start);
    paramIndex++;
  }

  if (payload.quiet_hours_end !== undefined) {
    updates.push(`quiet_hours_end = $${paramIndex}`);
    values.push(payload.quiet_hours_end);
    paramIndex++;
  }

  if (payload.timezone !== undefined) {
    updates.push(`timezone = $${paramIndex}`);
    values.push(payload.timezone);
  }

  if (updates.length === 0) {
    // No updates, just return current preferences
    return getOrCreateUserPreferences(userId);
  }

  const query = `
    UPDATE user_notification_preferences
    SET ${updates.join(', ')}, updated_at = NOW()
    WHERE user_id = $1
    RETURNING *
  `;

  const result = await pool.query<UserNotificationPreferences>(query, values);

  if (result.rows.length === 0 || !result.rows[0]) {
    // Preferences didn't exist, create them
    await createDefaultPreferences(userId);
    return updateUserPreferences(userId, payload);
  }

  return result.rows[0];
}
