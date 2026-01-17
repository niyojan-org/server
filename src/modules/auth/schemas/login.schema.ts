import z from "zod";

export const loginSchema = z.object({
  email: z.email({ message: "Invalid email address" }),
  password: z
    .string({
      error: (issue) => {
        if (issue.code === "invalid_type") {
          return "Password must be a string";
        }
        return "Invalid password";
      },
    })
    .min(6, { message: "Password must be at least 6 characters long" }),
});

export type LoginInput = z.infer<typeof loginSchema>;
