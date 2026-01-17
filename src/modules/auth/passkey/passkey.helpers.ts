import { Passkey } from "../security/user-security.types";

export const findPasskey = (passkey: Passkey[], credentialId: string) => {
  return passkey.find((p) => p.credentialId === credentialId);
};
