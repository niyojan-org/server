import UserModel from "@modules/user/user.model";
import { getOrCreateUserSecurity } from "../security/user-security.service";
import { startPasskeyAuthentication } from "../passkey/services/passkey.service";
import crypto from "crypto";
import { markMfaPending } from "./session.service";

export const checkEmailExists = async (email: string) => {
  const user = await UserModel.findOne({ email }).select("_id").lean();
  if (user) {
    const security = await getOrCreateUserSecurity(email);
    if (security.passkeys.length > 0) {
      const options = await startPasskeyAuthentication(email);
      await markMfaPending(email);
      return options;
    }
  }

  return {
    rpId: "orgatick.in",
    challenge: crypto.randomBytes(32).toString("base64url"),
    allowCredentials: undefined,
    timeout: 60000,
    userVerification: "required",
    extensions: undefined,
  };
};
