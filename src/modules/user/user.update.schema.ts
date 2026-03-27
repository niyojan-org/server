import z from "zod";
import { GENDER_OPTIONS } from "./user.constants";

export const userSelfDataUpdateSchema = z
  .object({
    name: z
      .string({
        error: (issue) => {
          if (issue.code === "invalid_type") return "Name must be a string";
          return "Name is required";
        },
      })
      .min(1, { message: "Name cannot be empty" })
      .max(100, { message: "Name cannot exceed 100 characters" })
      .optional(),

    gender: z.enum(GENDER_OPTIONS).optional(),
    phone_number: z.string().optional(),
    avatar: z.string().optional(),
    address: z.string().optional(),
    bio: z.string().max(500, { message: "Bio cannot exceed 500 characters" }).optional(),

    notificationsPreference: z
      .object({
        email: z.boolean().default(true),
        sms: z.boolean().default(false),
        push: z.boolean().default(true),
      })
      .optional(),
  })
  .refine((data) => Object.values(data).some((value) => value !== undefined), {
    message: "At least one valid field must be provided for update",
  });

export type UserSelfUpdateInput = z.infer<typeof userSelfDataUpdateSchema>;
