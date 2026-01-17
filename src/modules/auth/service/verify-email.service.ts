import UserModel from "@modules/user/user.model";
import { verifyEmailToken } from "./verification.service";
import ApiError from "@core/errors/api.error";
import { sendAuthEmail } from "@infra/mail";

export const verifyEmail = async (email: string, token: string) => {
  await verifyEmailToken(email, token);
  const user = await UserModel.findOne({ email });
  if (!user) {
    throw new ApiError(
      404,
      "User not found",
      "USER_NOT_FOUND",
      "No user found with the provided email."
    );
  }
  if (user.isVerified) {
    throw new ApiError(
      400,
      "Email already verified",
      "EMAIL_ALREADY_VERIFIED",
      "The email address has already been verified."
    );
  }
  user.isVerified = true;
  await user.save();
  sendAuthEmail.welcome(user.email, { name: user.name });
};
