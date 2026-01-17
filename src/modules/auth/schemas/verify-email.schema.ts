import z from "zod";

export const verifyEmailSchema = z.object({
  email: z.email({ message: "Invalid email address" }),
  token: z.string().min(1, { message: "Token is required" }),
});

export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>;
