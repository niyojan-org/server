import ApiError from "@core/errors/api.error";
import { getOrCreateUserSecurity } from "../security/user-security.service";
import { verifyTotpToken } from "./totp.helpers";
import { isMfaPending } from "../service";

export const verifyTotp = async (userId: string, token: string) => {
  const isPendingMfa = await isMfaPending(userId);
  if (!isPendingMfa) {
    throw new ApiError(
      400,
      "No pending MFA",
      "NO_PENDING_MFA",
      "There is no pending MFA verification for this user."
    );
  }
  const security = await getOrCreateUserSecurity(userId);
  if (!security.totp?.enabled || !security.totp?.secret) {
    throw new ApiError(
      400,
      "TOTP is not enabled for this user",
      "TOTP_NOT_ENABLED",
      "Two-factor authentication using TOTP is not enabled for your account. Please enable it in your security settings."
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
  return true;
};
