import speakeasy from "speakeasy";
import crypto from "crypto";

const ISSUER = "Orgatick";

export const generateTotpSecret = (userEmail: string, userName?: string): speakeasy.GeneratedSecret => {
  const label = `${ISSUER}:${userEmail}`;
  
  return speakeasy.generateSecret({ 
    length: 20, 
    name: label,
    issuer: ISSUER
  });
};

export const verifyTotpToken = (secret: string, token: string): boolean => {
  return speakeasy.totp.verify({
    secret,
    encoding: "base32",
    token,
    window: 1,
  });
};

export const generateBackupCodes = (count: number): string[] => {
  return Array.from({ length: count }, () => crypto.randomBytes(4).toString("hex"));
};
