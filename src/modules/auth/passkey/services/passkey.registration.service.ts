import env from "@config/env";
import { getOrCreateUserSecurity } from "@modules/auth/security/user-security.service";
import { UserDocument } from "@modules/user/user.types";
import {
  AuthenticatorTransportFuture,
  generateRegistrationOptions,
  RegistrationResponseJSON,
  verifyRegistrationResponse,
} from "@simplewebauthn/server";
import passkeyRedis from "../helper/passkey.redis";
import ApiError from "@core/errors/api.error";
import { getPasskeyDomain } from "@modules/domain/helper/domin.passkey";
import { generateBackupCodes } from "@modules/auth/totp/totp.helpers";
import bcrypt from "bcryptjs";

const RP_NAME = "Orgatick";
const RP_ID = env.RP_ID;

export const getRegistrationChallenge = async (user: UserDocument, deviceName?: string) => {
  const security = await getOrCreateUserSecurity(user._id.toString());
  const excludeCredentials = security.passkeys.map((pk) => ({
    id: pk.credentialId,
    transports: pk.transports as AuthenticatorTransportFuture[],
  }));
  const challenge = await generateRegistrationOptions({
    rpName: RP_NAME,
    rpID: RP_ID,
    userName: user.email,
    userDisplayName: user.name,
    attestationType: "none",
    authenticatorSelection: {
      residentKey: "preferred",
      userVerification: "preferred",
    },
    excludeCredentials,
  });
  await passkeyRedis.setRegistrationChallenge(user._id.toString(), challenge.challenge, deviceName);
  return challenge;
};

export const finishPasskeyRegistration = async (
  userId: string,
  credential: RegistrationResponseJSON
) => {
  const security = await getOrCreateUserSecurity(userId);
  const challengeData = await passkeyRedis.getRegistrationChallenge(userId);
  if (!challengeData) {
    throw new ApiError(
      400,
      "No registration challenge found",
      "NO_REGISTRATION_CHALLENGE",
      "No registration challenge found for completing passkey registration. Please initiate the registration process again."
    );
  }
  const domains = await getPasskeyDomain();

  const verification = await verifyRegistrationResponse({
    response: credential,
    expectedChallenge: challengeData.challenge,
    expectedOrigin: domains,
    expectedRPID: RP_ID,
    requireUserVerification: true,
  });
  if (!verification.verified) {
    throw new ApiError(
      400,
      "Passkey registration verification failed",
      "PASSKEY_REGISTRATION_VERIFICATION_FAILED",
      "The passkey registration verification process failed. Please try registering your passkey again."
    );
  }
  const { registrationInfo } = verification;
  const existing = security.passkeys.find(
    (pk) => pk.credentialId === registrationInfo!.credential.id
  );
  if (existing) {
    throw new ApiError(
      400,
      "Passkey already registered",
      "PASSKEY_ALREADY_REGISTERED",
      "This passkey is already registered with your account."
    );
  }
  const deviceName = challengeData.deviceName || "Unnamed Device";
  security.passkeys.push({
    credentialId: registrationInfo!.credential.id,
    publicKey: Buffer.from(registrationInfo!.credential.publicKey).toString("base64"),
    counter: registrationInfo!.credential.counter,
    name: deviceName,
    deviceName: deviceName,
    deviceType: registrationInfo!.credentialDeviceType,
    backedUp: registrationInfo!.credentialBackedUp,
    transports: credential.response.transports as string[] | undefined,
    createdAt: new Date(),
  });
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
