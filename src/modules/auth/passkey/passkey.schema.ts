import { z } from "zod";

export const startPasskeySchema = z.object({
  name: z
    .string({ message: "Name must be a string" })
    .min(1, { message: "Name must be at least 1 character long" })
    .max(50, { message: "Name must be at most 50 characters long" })
    .optional(),
});

export const editPasskeySchema = z.object({
  name: z
    .string({ message: "Name must be a string" })
    .min(1, { message: "Name must be at least 1 character long" })
    .max(50, { message: "Name must be at most 50 characters long" }),
});

export const passkeyIdParamSchema = z.object({
  passkeyId: z.string({ message: "Passkey ID must be a string" }),
});

export const finishPasskeySchema = z.object({
  credential: z.any(),
});

export const passkeyAuthenticationSchema = z.object({
  email: z.email({ message: "Email must be a valid email address" }),
  assertion: z.any(),
});

export const finishPasskeyAuthenticationSchema = z.object({
  email: z.email({ message: "Email must be a valid email address" }),
  assertion: z.any(),
});
