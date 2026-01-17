import ApiError from "@core/errors/api.error";
import { getOrCreateUserSecurity } from "../../security/user-security.service";
import { findPasskey } from "../passkey.helpers";
import {
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} from "@simplewebauthn/server";
import type { AuthenticationResponseJSON } from "@simplewebauthn/server";
import env from "@config/env";
import passkeyRedis from "../helper/passkey.redis";

export const verifyPasskeyAuthentication = async (
  userId: string,
  assertion: AuthenticationResponseJSON
) => {
  const challengeData = await passkeyRedis.getAuthenticationChallenge(userId);
  const expectedChallenge = challengeData?.challenge;
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
    await passkeyRedis.clearAuthenticationChallenge(userId);
    throw new ApiError(
      401,
      "Invalid passkey authentication",
      "INVALID_PASSKEY_AUTHENTICATION",
      "The passkey authentication failed. Please try again."
    );
  }

  // Update passkey counter and lastUsed to prevent replay attacks
  passkey.counter = verification.authenticationInfo.newCounter;
  passkey.lastUsedAt = new Date();
  await security.save();

  // Clear the authentication challenge
  await passkeyRedis.clearAuthenticationChallenge(userId);

  return verification;
};

export const startPasskeyAuthentication = async (userId: string) => {
  const security = await getOrCreateUserSecurity(userId);
  const passkeys = security.passkeys;
  if (passkeys.length === 0) {
    throw new ApiError(
      400,
      "No passkeys registered",
      "NO_PASSKEYS_REGISTERED",
      "You have no passkeys registered. Please register a passkey before attempting authentication."
    );
  }
  const options = await generateAuthenticationOptions({
    rpID: env.RP_ID,
    userVerification: "required",
    timeout: 60000,
  });
  await passkeyRedis.setAuthenticationChallenge(userId, options.challenge);
  return options;
};
