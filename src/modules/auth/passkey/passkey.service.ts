import ApiError from "@core/errors/api.error";
import { getOrCreateUserSecurity } from "../security/user-security.service";
import { findPasskey } from "./passkey.helpers";
import { verifyAuthenticationResponse } from "@simplewebauthn/server";
import type { AuthenticationResponseJSON } from "@simplewebauthn/server";
import env from "@config/env";

export const verifyPasskey = async (
  userId: string, 
  assertion: AuthenticationResponseJSON,
  expectedChallenge: string
) => {
  const security = await getOrCreateUserSecurity(userId);
  const passkey = findPasskey(security.passkeys, assertion.id);
  if (!passkey) {
    throw new ApiError(
      401,
      "Passkey not found",
      "PASSKEY_NOT_FOUND",
      "The provided passkey was not found for your account. Please ensure you are using the correct passkey."
    );
  }
  const verification = await verifyAuthenticationResponse({
    response: assertion,
    expectedChallenge,
    expectedOrigin: env.AUTH_URL,
    expectedRPID: env.RP_ID,
    credential: {
        id: passkey.credentialId,
        publicKey: Buffer.from(passkey.publicKey, "base64url"),
        counter: passkey.counter,
    },
  });

  if (!verification.verified) {
    throw new ApiError(
      401,
      "Invalid passkey authentication",
      "INVALID_PASSKEY_AUTHENTICATION",
      "The passkey authentication failed. Please try again."
    );
  }

  // Update counter to prevent replay attacks
  const passkeyIndex = security.passkeys.findIndex((p) => p.credentialId === passkey.credentialId);
  if (passkeyIndex !== -1 && verification.authenticationInfo?.newCounter !== undefined) {
    const newCounter = verification.authenticationInfo.newCounter;
    const passkeyToUpdate = security.passkeys[passkeyIndex];
    if (passkeyToUpdate) {
      passkeyToUpdate.counter = newCounter;
      await security.save();
    }
  }

  return verification;
};
