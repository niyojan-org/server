import ApiError from "@core/errors/api.error";
import UserModel from "@modules/user/user.model";
import { createResetToken, verifyResetToken } from "./password-reset.service";
import { sendAuthEmail } from "@infra/mail";
import { verifyPasswordStrength } from "./password.service";
import { resetPassword } from "./password-change.service";
import type { Request } from "express";
import env from "@config/env";

export const forgetPassword = async (email: string) => {
  const user = await UserModel.findOne({ email });
  if (!user) {
    throw new ApiError(
      404,
      "User not found",
      "USER_NOT_FOUND",
      "No user found with the provided email address"
    );
  }
  const token = await createResetToken(email);
  const resetUrl = `${env.AUTH_URL}/auth/changePassword?email=${encodeURIComponent(
    email
  )}&token=${token}`;
  await sendAuthEmail.passwordReset(email, {
    name: user.name,
    resetUrl,
  });
};

export const resetPasswordWithToken = async (
  email: string,
  newPassword: string,
  token: string,
  req?: Request
) => {
  await verifyResetToken(email, token);
  verifyPasswordStrength(newPassword);
  await resetPassword(email, newPassword, req);
};
