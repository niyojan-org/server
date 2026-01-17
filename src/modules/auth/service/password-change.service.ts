import ApiError from "@core/errors/api.error";
import { getIPAndLocation } from "@core/utils/ip.utils";
import { sendAuthEmail } from "@infra/mail";
import UserModel from "@modules/user/user.model";
import bcrypt from "bcryptjs";
import type { Request } from "express";

export const changePassword = async (
  userId: string,
  oldPassword: string,
  newPassword: string,
  req?: Request
) => {
  const user = await UserModel.findById(userId).select("+password");
  const isMatch = await bcrypt.compare(oldPassword, user!.password!);
  if (!isMatch) {
    throw new ApiError(
      400,
      "Old password is incorrect",
      "INCORRECT_OLD_PASSWORD",
      "The provided old password does not match our records"
    );
  }
  const newPasswordMatch = await bcrypt.compare(newPassword, user!.password!);
  if (newPasswordMatch) {
    throw new ApiError(
      400,
      "New password must be different from old password",
      "SAME_PASSWORD",
      "The new password provided is the same as the old password"
    );
  }
  user!.password = newPassword;
  await user!.save();

  const { ip, location } = await getIPAndLocation(req);
  await sendAuthEmail.passwordChanged(user!.email, {
    name: user!.name,
    changeTime: new Date().toISOString(),
    ipAddress: ip,
    location,
    supportUrl: "https://orgatick.in/contact",
  });
};

export const resetPassword = async (email: string, newPassword: string, req?: Request) => {
  const user = await UserModel.findOne({ email }).select("+password");
  if (!user) {
    throw new ApiError(
      404,
      "User not found",
      "USER_NOT_FOUND",
      "No user found with the provided email address"
    );
  }
  user.password = newPassword;
  await user.save();
  const { ip, location } = await getIPAndLocation(req);
  await sendAuthEmail.passwordChanged(email, {
    name: user.name,
    changeTime: new Date().toISOString(),
    ipAddress: ip,
    location,
    supportUrl: "https://orgatick.in/contact",
  });
};
