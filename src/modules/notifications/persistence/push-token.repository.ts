import { pool } from '@config/pg';
import { PushToken, RegisterPushTokenPayload } from '../types/preferences.types';

export async function registerPushToken(
  userId: string,
  payload: RegisterPushTokenPayload
): Promise<PushToken> {
  // Extract device info for device_id
  const deviceId = payload.deviceInfo 
    ? `${payload.deviceInfo.platform || 'unknown'}_${payload.deviceInfo.vendor || 'unknown'}`.substring(0, 100)
    : undefined;
  
  const deviceType = payload.deviceType || 'web';
  const token = payload.subscription; // The subscription IS the token for web push

  // First, try to update existing token
  const updateResult = await pool.query<PushToken>(
    `UPDATE push_tokens 
     SET is_active = TRUE, last_used_at = NOW(), device_type = $3, device_id = $4
     WHERE user_id = $1 AND token = $2
     RETURNING *`,
    [userId, token, deviceType, deviceId]
  );

  if (updateResult.rows.length > 0 && updateResult.rows[0]) {
    return updateResult.rows[0];
  }

  // Insert new token
  const insertResult = await pool.query<PushToken>(
    `INSERT INTO push_tokens (user_id, token, device_type, device_id)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (token) DO UPDATE
     SET is_active = TRUE, last_used_at = NOW(), user_id = $1, device_type = $3, device_id = $4
     RETURNING *`,
    [userId, token, deviceType, deviceId]
  );

  if (!insertResult.rows[0]) {
    throw new Error('Failed to register push token');
  }

  return insertResult.rows[0];
}

export async function getActivePushTokens(userId: string): Promise<PushToken[]> {
  const result = await pool.query<PushToken>(
    `SELECT * FROM push_tokens 
     WHERE user_id = $1 AND is_active = TRUE
     ORDER BY last_used_at DESC`,
    [userId]
  );

  return result.rows;
}

export async function getUserPushTokens(userId: string): Promise<PushToken[]> {
  const result = await pool.query<PushToken>(
    `SELECT * FROM push_tokens 
     WHERE user_id = $1
     ORDER BY last_used_at DESC`,
    [userId]
  );

  return result.rows;
}

export async function deactivatePushToken(
  userId: string,
  token: string
): Promise<PushToken | null> {
  const result = await pool.query<PushToken>(
    `UPDATE push_tokens 
     SET is_active = FALSE
     WHERE user_id = $1 AND token = $2
     RETURNING *`,
    [userId, token]
  );

  return result.rows[0] || null;
}

export async function deactivatePushTokens(tokens: string[]): Promise<number> {
  const result = await pool.query(
    `UPDATE push_tokens 
     SET is_active = FALSE
     WHERE token = ANY($1)`,
    [tokens]
  );

  return result.rowCount || 0;
}

export async function updateTokenLastUsed(token: string): Promise<void> {
  await pool.query(
    `UPDATE push_tokens 
     SET last_used_at = NOW()
     WHERE token = $1`,
    [token]
  );
}

export async function cleanupInactiveTokens(days = 60): Promise<number> {
  const result = await pool.query(
    `DELETE FROM push_tokens
     WHERE is_active = FALSE
       AND last_used_at < NOW() - INTERVAL '${days} days'`
  );

  return result.rowCount || 0;
}
