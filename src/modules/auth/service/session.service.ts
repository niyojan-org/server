import crypto from "crypto";
import redis from "@config/redis";
import ApiError from "@core/errors/api.error";

const SESSION_TTL = 30 * 10 * 60 * 60; // 30 days in seconds
const MFA_TTL = 10 * 60; // 10 minutes in seconds

const sessionKey = (userId: string) => `user:${userId}:session`;
const mfaKey = (email: string) => `mfa:pending:${email}`;

export const createSession = async (userId: string): Promise<string> => {
  const sessionId = crypto.randomBytes(16).toString("hex");
  await redis.setex(sessionKey(userId), SESSION_TTL, sessionId);
  return sessionId;
};

export const validateSession = async (userId: string, sessionId: string): Promise<boolean> => {
  const storedSessionId = await redis.get(sessionKey(userId));
  if (!storedSessionId || storedSessionId !== sessionId) {
    throw new ApiError(
      401,
      "Session expired",
      "SESSION_EXPIRED",
      "User session has expired, please log in again",
    );
  }
  return storedSessionId === sessionId;
};

export const destroySession = async (userId: string): Promise<void> => {
  await redis.del(sessionKey(userId));
};

//MFA Session Management

export const markMfaPending = async (email: string): Promise<void> => {
  await redis.setex(mfaKey(email), MFA_TTL, "1");
};
export const isMfaPending = async (email: string): Promise<boolean> => {
  const pending = await redis.get(mfaKey(email));
  return Boolean(pending);
};
export const clearMfaPending = async (email: string): Promise<void> => {
  await redis.del(mfaKey(email));
};
