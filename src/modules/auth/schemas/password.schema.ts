import { z } from "zod";

export const forgetPasswordSchema = z.object({
  email: z.email({ message: "Email is required" }),
});

export const resetPasswordSchema = z.object({
  email: z.email({ message: "Email is required" }),
  token: z
    .string({ message: "Token is required" })
    .min(10, "Minimum token length is 10 characters"),
  newPassword: z
    .string({ message: "New password is required" })
    .min(6, { message: "Minimum password length is 6 characters" }),
});

export const changePasswordSchema = z.object({
  oldPassword: z
    .string({ message: "Old password is required" })
    .min(6, { message: "Minimum password length is 6 characters" }),
  newPassword: z
    .string({ message: "New password is required" })
    .min(6, { message: "Minimum password length is 6 characters" }),
});

export type ForgetPasswordInput = z.infer<typeof forgetPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
