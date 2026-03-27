import { z } from "zod";
import { Types } from "mongoose";

const passkeyZodSchema = z.object({
  _id: z
    .custom<Types.ObjectId>((val) => val instanceof Types.ObjectId, { message: "Invalid ObjectId" })
    .optional(),
  credentialId: z.string(),
  publicKey: z.string(),
  name: z.string().optional(),
  counter: z.number().default(0),
  deviceName: z.string().optional(),
  createdAt: z.date().default(() => new Date()),
  lastUsedAt: z.date().optional(),
  deviceType: z.string().optional(),
  backedUp: z.boolean().optional(),
  transports: z.array(z.string()).optional(),
});

const totpZodSchema = z.object({
  secret: z.string().optional(),
  enabled: z.boolean().default(false),
  verifiedAt: z.date().optional(),
});

const backupCodeZodSchema = z.object({
  codeHash: z.string(),
  usedAt: z.date().optional().nullable(),
});

export { passkeyZodSchema, totpZodSchema, backupCodeZodSchema };

export const userSecurityZodSchema = z.object({
  userId: z.custom<Types.ObjectId>((val) => val instanceof Types.ObjectId, {
    message: "Invalid ObjectId",
  }),
  email: z.email(),
  totp: totpZodSchema.optional(),
  passkeys: z.array(passkeyZodSchema).default([]),
  backupCodes: z.array(backupCodeZodSchema).default([]),
  lastMfaAt: z.date().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export const createUserSecurityZodSchema = userSecurityZodSchema.omit({
  createdAt: true,
  updatedAt: true,
});

export const updateUserSecurityZodSchema = userSecurityZodSchema
  .omit({
    userId: true,
    createdAt: true,
    updatedAt: true,
  })
  .partial();
