import redis from "@config/redis";
import ApiError from "@core/errors/api.error";
import crypto from "crypto";
const TTL = 10 * 60; // 10 minutes in seconds
const key = (email: string) => `password-reset:${email}`;

export const createResetToken = async (email: string) => {
  const token = crypto.randomBytes(32).toString("hex");
  await redis.setex(key(email), TTL, token);
  return token;
};

export const verifyResetToken = async (email: string, token: string) => {
  const storedToken = await redis.get(key(email));
  if (storedToken !== token) {
    throw new ApiError(
      400,
      "Invalid or expired reset token",
      "INVALID_RESET_TOKEN",
      "The provided password reset token is invalid or has expired",
    );
  }
  await redis.del(key(email));
};
