import redis from '@config/redis';
import {
  UserPreferences,
  ChannelPreferences,
  UserNotificationPreferences,
  UpdatePreferencesPayload,
} from '../types/preferences.types';
import * as preferencesRepository from '../persistence/preferences.repository';

const CACHE_TTL = 300; // 5 minutes
const CACHE_PREFIX = 'user:preferences:';

export async function checkUserPreferences(
  userId: string,
  notificationType: string
): Promise<UserPreferences> {
  // Try cache first
  const cacheKey = `${CACHE_PREFIX}${userId}`;
  const cached = await redis?.get(cacheKey);

  let prefs;

  if (cached) {
    prefs = JSON.parse(cached);
  } else {
    // Fetch from DB
    prefs = await preferencesRepository.getOrCreateUserPreferences(userId);

    // Cache for 5 minutes
    if (redis) {
      await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(prefs));
    }
  }

  return extractChannelPreferences(prefs, notificationType);
}

function extractChannelPreferences(
  prefs: UserNotificationPreferences,
  notificationType: string,
): UserPreferences {
  const categoryPrefs: ChannelPreferences =
    prefs.preferences?.[notificationType] || {};

  return {
    push: prefs.push_enabled && (categoryPrefs.push ?? true),
    inApp: prefs.in_app_enabled && (categoryPrefs.in_app ?? true),
  };
}

export async function getUserPreferences(userId: string) {
  return preferencesRepository.getOrCreateUserPreferences(userId);
}

export async function updateUserPreferences(
  userId: string,
  payload: UpdatePreferencesPayload,
) {
  const updated = await preferencesRepository.updateUserPreferences(
    userId,
    payload
  );

  // Invalidate cache
  const cacheKey = `${CACHE_PREFIX}${userId}`;
  await redis?.del(cacheKey);

  return updated;
}

export async function isInQuietHours(userId: string): Promise<boolean> {
  const prefs = await getUserPreferences(userId);

  if (!prefs.quiet_hours_enabled || !prefs.quiet_hours_start || !prefs.quiet_hours_end) {
    return false;
  }

  // Get current time in user's timezone
  const now = new Date();
  const userTime = new Date(
    now.toLocaleString('en-US', { timeZone: prefs.timezone })
  );

  const currentHour = userTime.getHours();
  const currentMinute = userTime.getMinutes();
  const currentTimeInMinutes = currentHour * 60 + currentMinute;

  const startParts = prefs.quiet_hours_start.split(':').map(Number);
  const endParts = prefs.quiet_hours_end.split(':').map(Number);
  
  const startHour = startParts[0] ?? 0;
  const startMinute = startParts[1] ?? 0;
  const endHour = endParts[0] ?? 0;
  const endMinute = endParts[1] ?? 0;
  
  const startTimeInMinutes = startHour * 60 + startMinute;
  const endTimeInMinutes = endHour * 60 + endMinute;

  // Handle overnight quiet hours (e.g., 22:00 to 08:00)
  if (startTimeInMinutes > endTimeInMinutes) {
    return currentTimeInMinutes >= startTimeInMinutes || currentTimeInMinutes <= endTimeInMinutes;
  }

  return currentTimeInMinutes >= startTimeInMinutes && currentTimeInMinutes <= endTimeInMinutes;
}
