import ApiError from "@core/errors/api.error";
import UserModel from "@modules/user/user.model";
import { createResetToken, verifyResetToken } from "./password-reset.service";
import { sendAuthEmail } from "@infra/mail";
import { verifyPasswordStrength } from "./password.service";
import { resetPassword } from "./password-change.service";
import type { Request } from "express";
import env from "@config/env";
import redis from "@config/redis";

const RESET_LINK_RESEND_COOLDOWN = 5 * 60; // 5 minutes
const resetRateLimitKey = (email: string) => `user:passwordReset:ratelimit:${email}`;

export const forgetPassword = async (email: string) => {
  const normalizedEmail = email.trim().toLowerCase();

  const lastSent = await redis.get(resetRateLimitKey(normalizedEmail));
  if (lastSent) {
    const ttl = await redis.ttl(resetRateLimitKey(normalizedEmail));
    const minutesRemaining = Math.max(1, Math.ceil(ttl / 60));
    throw new ApiError(
      429,
      `Please wait ${minutesRemaining} minute(s) before requesting another password reset email.`,
      "RATE_LIMIT_EXCEEDED",
      `Please wait ${minutesRemaining} minute(s) before requesting another password reset email.`,
    );
  }

  const user = await UserModel.findOne({ email: normalizedEmail });
  if (!user) {
    return; // To prevent email enumeration, we return a generic success response even if the user is not found
  }
  const token = await createResetToken(normalizedEmail);
  const resetUrl = `${env.AUTH_URL}/change-password?email=${encodeURIComponent(
    normalizedEmail,
  )}&token=${token}`;
  await sendAuthEmail.passwordReset(normalizedEmail, {
    name: user.name,
    resetUrl,
  });

  await redis.setex(
    resetRateLimitKey(normalizedEmail),
    RESET_LINK_RESEND_COOLDOWN,
    Date.now().toString(),
  );
};

export const resetPasswordWithToken = async (
  email: string,
  newPassword: string,
  token: string,
  req?: Request,
) => {
  const normalizedEmail = email.trim().toLowerCase();
  await verifyResetToken(normalizedEmail, token);
  verifyPasswordStrength(newPassword);
  await resetPassword(normalizedEmail, newPassword, req);
};
