import z from "zod";

export const confirmTotpSchema = z.object({
  token: z
    .string({ message: "Token must be a string" })
    .min(6, { message: "Token must be 6 characters long" })
    .max(6, { message: "Token must be 6 characters long" }),
});
