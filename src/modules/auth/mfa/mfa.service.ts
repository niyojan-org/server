import UserModel from "@modules/user/user.model";
import { getOrCreateUserSecurity } from "../security/user-security.service";
import { UserDocument } from "@modules/user/user.types";
import { Request } from "express";
import {
  clearMfaPending,
  createSession,
  generateTokens,
  isMfaPending,
} from "../service";
import ApiError from "@core/errors/api.error";
import { setRefreshToken } from "../helper/cookies.helper";

export const checkMfa = async (email: string) => {
  const security = await getOrCreateUserSecurity(email);
  const hasTotp = security.totp?.enabled;
  const hasPasskeys = security.passkeys.length > 0;
  const hasBackupCodes = security.backupCodes.length > 0;
  return {
    required: hasTotp || hasPasskeys || hasBackupCodes,
    methods: {
      totp: hasTotp,
      passkey: hasPasskeys,
      backup_code: hasBackupCodes,
    },
  };
};

export const getMfaStatus = async (user: UserDocument) => {
  const security = await getOrCreateUserSecurity(user.email);
  return {
    enabled:
      security.totp?.enabled || security.passkeys.length > 0 || security.backupCodes.length > 0,
    methods: {
      totp: { enable: security.totp?.enabled || false },
      passkey: { enable: security.passkeys.length > 0, count: security.passkeys.length },
      backup_code: { available: security.backupCodes.filter((code) => !code.usedAt).length || 0 },
    },
  };
};

export const completeMfaLogin = async (email: string, req: Request) => {
  const pendingMfa = await isMfaPending(email);
  if (!pendingMfa) {
    throw new ApiError(
      400,
      "No pending MFA",
      "NO_PENDING_MFA",
      "There is no pending MFA verification for this user.",
    );
  }
  const user = await UserModel.findOne({ email });
  if (!user) {
    throw new ApiError(
      404,
      "User not found",
      "USER_NOT_FOUND",
      "The specified user does not exist.",
    );
  }
  await clearMfaPending(email);
  const sessionId = await createSession(user._id.toString());
  const { accessToken, refreshToken } = await generateTokens({
    userId: user._id.toString(),
    sessionId,
  });
  setRefreshToken(req.res!, refreshToken);
  const userWithoutPassword = user.toJSON() as unknown as Record<string, unknown>;
  delete userWithoutPassword.password;
  return { token: accessToken, ...userWithoutPassword };
};
