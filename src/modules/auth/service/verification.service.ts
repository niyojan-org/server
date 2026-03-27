import env from "@config/env";
import redis from "@config/redis";
import ApiError from "@core/errors/api.error";
import { sendAuthEmail } from "@infra/mail";
import crypto from "crypto";

const TOKEN_TTL = 10 * 60; // 10 minutes
const RESEND_COOLDOWN = 5 * 60; // 5 minutes cooldown for resending
const key = (email: string) => `user:emailVerification:${email}`;
const rateLimitKey = (email: string) => `user:emailVerification:ratelimit:${email}`;

export const sendVerificationEmail = async (user: { name: string; email: string }) => {
  // Check rate limit
  const lastSent = await redis.get(rateLimitKey(user.email));
  if (lastSent) {
    const ttl = await redis.ttl(rateLimitKey(user.email));
    const minutesRemaining = Math.ceil(ttl / 60);
    throw new ApiError(
      429,
      "Too many requests",
      "RATE_LIMIT_EXCEEDED",
      `Please wait ${minutesRemaining} minute(s) before requesting another verification email.`,
    );
  }

  const token = crypto.randomBytes(16).toString("hex");
  await redis.setex(key(user.email), TOKEN_TTL, token);
  const url = `${env.AUTH_URL}/verify-email?email=${encodeURIComponent(user.email)}&token=${token}`;
  await sendAuthEmail.verifyEmail(user.email, {
    name: user.name,
    verificationUrl: url,
  });

  // Set rate limit after successful send
  await redis.setex(rateLimitKey(user.email), RESEND_COOLDOWN, Date.now().toString());
};

export const verifyEmailToken = async (email: string, token: string) => {
  const stored = await redis.get(key(email));
  if (!stored || stored !== token) {
    throw new ApiError(
      401,
      "Invalid or expired verification token",
      "INVALID_VERIFICATION_TOKEN",
      "The provided email verification token is either invalid or has expired.",
    );
  }
  await redis.del(key(email));
};
