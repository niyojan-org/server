import { z } from "zod";
import {
  passkeyZodSchema,
  totpZodSchema,
  backupCodeZodSchema,
  userSecurityZodSchema,
  createUserSecurityZodSchema,
  updateUserSecurityZodSchema,
} from "./user-security.schema";
import { Document, Types } from "mongoose";

export type Passkey = z.infer<typeof passkeyZodSchema>;
export type Totp = z.infer<typeof totpZodSchema>;
export type BackupCode = z.infer<typeof backupCodeZodSchema>;
export type UserSecurity = z.infer<typeof userSecurityZodSchema>;
export type CreateUserSecurity = z.infer<typeof createUserSecurityZodSchema>;
export type UpdateUserSecurity = z.infer<typeof updateUserSecurityZodSchema>;

export interface IUserSecurity {
  userId: Types.ObjectId;
  totp?: {
    secret?: string;
    enabled: boolean;
    verifiedAt?: Date;
  };
  passkeys: Array<{
    credentialId: string;
    publicKey: string;
    counter: number;
    deviceName?: string;
    createdAt: Date;
  }>;
  backupCodes: Array<{
    codeHash: string;
    usedAt?: Date;
  }>;
  lastMfaAt?: Date;
}

export type UserSecurityDocument = UserSecurity & Document;
