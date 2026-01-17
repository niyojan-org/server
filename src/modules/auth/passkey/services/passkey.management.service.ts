import ApiError from "@core/errors/api.error";
import { getOrCreateUserSecurity } from "@modules/auth/security/user-security.service";

export const getPasskeys = async (userId: string) => {
  const security = await getOrCreateUserSecurity(userId);
  return security.passkeys.map((pk) => ({
    id: pk._id?.toString() ?? pk.credentialId,
    credentialId: pk.credentialId,
    name: pk.name,
    deviceName: pk.deviceName,
    createdAt: pk.createdAt,
    lastUsedAt: pk.lastUsedAt,
  }));
};

export const editPasskey = async (userId: string, passkeyId: string, name: string) => {
  const security = await getOrCreateUserSecurity(userId);
  const passkey = security.passkeys.find((pk) => pk.credentialId === passkeyId);
  if (!passkey) {
    throw new ApiError(
      404,
      "Passkey not found",
      "PASSKEY_NOT_FOUND",
      "The specified passkey could not be found in your account."
    );
  }
  passkey.name = name;
  await security.save();
  return passkey;
};

export const deletePasskey = async (userId: string, passkeyId: string) => {
  const security = await getOrCreateUserSecurity(userId);
  const passkeyIndex = security.passkeys.findIndex((pk) => pk.credentialId === passkeyId);
  if (passkeyIndex === -1) {
    throw new ApiError(
      404,
      "Passkey not found",
      "PASSKEY_NOT_FOUND",
      "The specified passkey could not be found in your account."
    );
  }
  security.passkeys.splice(passkeyIndex, 1);
  if (security.passkeys.length === 0) {
    security.backupCodes = [];
  }
  await security.save();
};
