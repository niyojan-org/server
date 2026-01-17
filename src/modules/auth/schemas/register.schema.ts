import { GENDER_OPTIONS } from "@modules/user/user.constants";
import z from "zod";

export const registerSchema = z.object({
  email: z.email({ message: "Invalid email address" }),
  name: z
    .string({
      error: (issue) => {
        if (issue.code === "invalid_type") {
          return "Name must be a string";
        }
        return "Invalid name";
      },
    })
    .min(2, { message: "Name must be at least 2 characters long" }),
  password: z
    .string({
      error: (issue) => {
        if (issue.code === "invalid_type") {
          return "Password must be a string";
        }
        return "Invalid password";
      },
    })
    .min(8, { message: "Password must be at least 8 characters long" }),
  gender: z
    .enum(GENDER_OPTIONS, { message: `Gender must be one of ${GENDER_OPTIONS.join(", ")}` })
    .optional(),
  avatar: z.httpUrl().optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;