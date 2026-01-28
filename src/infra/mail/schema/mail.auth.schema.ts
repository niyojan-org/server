import z from "zod";

export const welcomeSchema = z.object({
  name: z
    .string()
    .min(1, { message: "Name is required" })
    .max(100, { message: "Name must be at most 100 characters" }),
});

export const verifyEmailSchema = z.object({
  name: z.string(),
  verificationUrl: z.string(),
});

export const LoginSchema = z.object({
  name: z.string(),
  loginTime: z.string(),
  location: z.string(),
  ipAddress: z.string(),
  browser: z.string(),
  securityUrl: z.string(),
});

export const NewDeviceLoginSchema = z.object({
  name: z.string(),
  device: z.string(),
  loginTime: z.string(),
  location: z.string(),
  ipAddress: z.string(),
  securityUrl: z.string(),
});

export const PasswordResetSchema = z.object({
  name: z.string(),
  resetUrl: z.string(),
});

export const PasswordChangedSchema = z.object({
  name: z.string(),
  changeTime: z.string(),
  location: z.string(),
  ipAddress: z.string(),
  supportUrl: z.string(),
});

export const AccountLockedSchema = z.object({
  name: z.string(),
  attemptCount: z.number(),
  lockTime: z.string(),
  location: z.string(),
  ipAddress: z.string(),
  unlockUrl: z.string(),
});

export const AccountDeletedSchema = z.object({
  name: z.string(),
  deletionTime: z.string().optional(),
  supportUrl: z.string().optional(),
});

export const emailChange = z.object({
  name: z.string(),
  oldEmail: z.string(),
  newEmail: z.string(),
  verificationCode: z.string().optional(),
  verificationUrl: z.string(),
});

export const AccountReactivationSchema = z.object({
  name: z.string(),
  reactivationUrl: z.string(),
  reactivationCode: z.string().optional(),
});
