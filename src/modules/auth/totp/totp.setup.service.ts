import ApiError from "@core/errors/api.error";
import { getOrCreateUserSecurity } from "../security/user-security.service";
import { generateBackupCodes, generateTotpSecret, verifyTotpToken } from "./totp.helpers";
import { UserDocument } from "@modules/user/user.types";
import bcrypt from "bcryptjs";

export const startTotpSetup = async (user: UserDocument) => {
  const security = await getOrCreateUserSecurity(user._id.toString());
  if (security.totp?.enabled) {
    throw new ApiError(
      400,
      "TOTP is already enabled",
      "TOTP_ALREADY_ENABLED",
      "Two-factor authentication using TOTP is already enabled for your account."
    );
  }

  const secret = generateTotpSecret(user.email, user.name);
  security.totp = {
    enabled: false,
    secret: secret.base32,
  };
  await security.save();
  return {
    otpauthUrl: secret.otpauth_url,
    base32: secret.base32,
  };
};

export const confirmTotpSetup = async (userId: string, token: string) => {
  const security = await getOrCreateUserSecurity(userId);
  if (!security.totp?.secret || security.totp.enabled) {
    throw new ApiError(
      400,
      "TOTP setup not initiated or already enabled",
      "TOTP_SETUP_NOT_INITIATED_OR_ALREADY_ENABLED",
      "Two-factor authentication using TOTP setup has not been initiated or is already enabled for your account."
    );
  }
  const valid = verifyTotpToken(security.totp.secret, token);
  if (!valid) {
    throw new ApiError(
      401,
      "Invalid TOTP token",
      "INVALID_TOTP_TOKEN",
      "The provided TOTP token is invalid. Please check the token and try again."
    );
  }
  security.totp.enabled = true;
  security.totp.verifiedAt = new Date();
  security.lastMfaAt = new Date();
  let backupCodes: string[] = [];
  if (!security.backupCodes || security.backupCodes.length === 0) {
    backupCodes = generateBackupCodes(10);
    for (const code of backupCodes) {
      const hashedCode = await bcrypt.hash(code, 12);
      security.backupCodes.push({ codeHash: hashedCode });
    }
  }
  await security.save();
  return { backupCodes };
};
