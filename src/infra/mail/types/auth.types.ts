import z from "zod";
import { AuthSchema } from "../schema";

export type WelcomeType = z.infer<typeof AuthSchema.welcomeSchema>;
export type VerifyEmailType = z.infer<typeof AuthSchema.verifyEmailSchema>;
export type LoginType = z.infer<typeof AuthSchema.LoginSchema>;
export type NewDeviceLoginType = z.infer<typeof AuthSchema.NewDeviceLoginSchema>;
export type PasswordResetType = z.infer<typeof AuthSchema.PasswordResetSchema>;
export type PasswordChangedType = z.infer<typeof AuthSchema.PasswordChangedSchema>;
export type AccountLockedType = z.infer<typeof AuthSchema.AccountLockedSchema>;
export type AccountDeletedType = z.infer<typeof AuthSchema.AccountDeletedSchema>;
