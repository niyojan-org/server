import z from "zod";
import { AUTH_PROVIDERS, GENDER_OPTIONS, ORGANIZATION_ROLES, USER_ROLES } from "./user.constants";
import { Types } from "mongoose";

export const userZodSchema = z
  .object({
    name: z
      .string({
        error: (issue) => {
          if (issue.code === "invalid_type") return "Name must be a string";
          return "Name is required";
        },
      })
      .min(1, { message: "Name cannot be empty" })
      .max(100, { message: "Name cannot exceed 100 characters" }),
    email: z.email({ message: "Invalid email address" }),
    password: z
      .string({
        error: (issue) => {
          if (issue.code === "invalid_type") return "Password must be a string";
          return "Password is required";
        },
      })
      .min(6, { message: "Password must be at least 6 characters long" })
      .optional(),
    lastPasswordChangeAt: z.date().optional(),
    lastLoginProvider: z.enum(AUTH_PROVIDERS).optional(),
    isVerified: z.boolean().default(false),

    provider: z.enum(AUTH_PROVIDERS).default("local").optional(),
    providerId: z.string().optional(),

    gender: z.enum(GENDER_OPTIONS).optional(),
    phone_number: z.string().optional(),
    avatar: z.string().optional(),
    address: z.string().optional(),
    bio: z.string().max(500, { message: "Bio cannot exceed 500 characters" }).optional(),

    role: z.enum(USER_ROLES).default("user"),

    organization: z
      .object({
        id: z.instanceof(Types.ObjectId),
        status: z.enum(["active", "pending", "inactive"]),
        role: z.enum(ORGANIZATION_ROLES),
        joinedAt: z.date(),
        invitationToken: z.string().optional(),
        invitedBy: z.instanceof(Types.ObjectId).optional(),
      })
      .optional(),

    notificationsPreference: z
      .object({
        email: z.boolean().default(true),
        sms: z.boolean().default(false),
        push: z.boolean().default(true),
      })
      .optional(),

    createdAt: z.date().optional(),
    updatedAt: z.date().optional(),
  })
  .refine(
    (data) => {
      // For local auth, password is required
      if (data.provider === "local") {
        return !!data.password;
      }
      // For OAuth providers, providerId is required
      return !!data.providerId;
    },
    {
      message: "Password is required for local authentication, providerId is required for OAuth",
      path: ["password"],
    },
  );

export type CreateUser = z.infer<typeof userZodSchema>;
