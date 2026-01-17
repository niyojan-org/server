import type { Request } from "express";
import UserModel from "@modules/user/user.model";
import { LoginInput } from "../schemas/login.schema";
import ApiError from "@core/errors/api.error";
import { verifyPassword } from "./password.service";
import { createSession, markMfaPending } from "./session.service";
import { generateTokens } from "./token.service";
import { setRefreshToken } from "../helper/cookies.helper";
import { sendVerificationEmail } from "./verification.service";
import { UserDocument } from "@modules/user/user.types";
import { checkMfa } from "../mfa/mfa.service";

export const login = async (input: LoginInput, req: Request) => {
  const user = await UserModel.findOne({ email: input.email }).select("+password");
  if (!user) {
    throw new ApiError(401, "User not found", "AUTH_SERVICE", "User not found with provided email");
  }
  if (!user.password) {
    throw new ApiError(
      401,
      "Password not set",
      "AUTH_SERVICE",
      "User does not have a password set. Please use another login method or reset your password."
    );
  }
  await verifyPassword(input.password, user.password);
  if (!user.isVerified) {
    try {
      await sendVerificationEmail({ name: user.name, email: user.email });
      throw new ApiError(
        403,
        "Account not verified",
        "ACCOUNT_NOT_VERIFIED",
        "User account is not verified. A new verification email has been sent."
      );
    } catch (error) {
      if (error instanceof ApiError && error.code === "RATE_LIMIT_EXCEEDED") {
        throw new ApiError(
          403,
          "Account not verified",
          "ACCOUNT_NOT_VERIFIED",
          `User account is not verified. ${error.details}`
        );
      }
      throw error;
    }
  }
  const mfa = await checkMfa(user._id.toString());
  if (mfa.required) {
    await markMfaPending(user._id.toString());
    return {
      requiresTOTP: mfa.methods.totp,
      requiresPasskey: mfa.methods.passkey,
      userId: user._id,
    };
  }

  const sessionId = await createSession(user._id.toString());
  const { accessToken, refreshToken } = await generateTokens({
    userId: user._id.toString(),
    sessionId,
  });
  setRefreshToken(req.res!, refreshToken);
  const { password, ...userWithoutPassword } = user.toJSON();
  return { token: accessToken, ...userWithoutPassword };
};

export const completeOAuthLogin = async (user: UserDocument, req: Request) => {
  //MFA CHECK TO BE ADDED HERE LATER
  const sessionId = await createSession(user._id.toString());
  const { accessToken, refreshToken } = await generateTokens({
    userId: user._id.toString(),
    sessionId,
  });
  setRefreshToken(req.res!, refreshToken);
  const { password, ...userWithoutPassword } = user.toJSON();
  return { token: accessToken, ...userWithoutPassword };
};
