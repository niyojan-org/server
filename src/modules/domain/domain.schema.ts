import { Types } from "mongoose";
import z from "zod";
import { DOMAIN_ENVIRONMENTS, DOMAIN_PURPOSES, DOMAIN_REGEX } from "./domain.constants";

export const domainSchemaZod = z.object({
  _id: z.instanceof(Types.ObjectId).optional(),
  domain: z
    .string({
      error: (issue) => {
        if (issue.code === "invalid_type") return "Domain must be a string";
        return "Domain is required";
      },
    })
    .min(1, "Domain cannot be empty")
    .max(100, "Domain cannot exceed 100 characters")
    .regex(DOMAIN_REGEX, "Invalid domain format"),
  isActive: z.boolean().default(true),
  purposes: z
    .object(
      {
        cors: z.boolean().default(false),
        passkey: z.boolean().default(false),
        oauth: z.boolean().default(false),
        api: z.boolean().default(false),
        admin: z.boolean().default(false),
        auth: z.boolean().default(false),
      },
      {
        message: "Purposes must be an object",
      }
    )
    .optional(),
  environment: z.enum(DOMAIN_ENVIRONMENTS, {
    error: (issue) => {
      if (issue.code === "invalid_value")
        return `Environment must be in [${DOMAIN_ENVIRONMENTS.join(", ")}]`;
      return "Invalid environment value";
    },
  }),
  notes: z.string().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

// Validation schemas for params
export const idParamSchema = z.object({
  id: z.string().refine((val) => Types.ObjectId.isValid(val), {
    message: "Invalid domain ID format",
  }),
});

export const envParamSchema = z.object({
  env: z.enum(DOMAIN_ENVIRONMENTS, {
    message: `Environment must be one of: ${DOMAIN_ENVIRONMENTS.join(", ")}`,
  }),
});

export const purposeAndEnvParamSchema = z.object({
  purpose: z.enum(DOMAIN_PURPOSES, {
    message: `Purpose must be one of: ${DOMAIN_PURPOSES.join(", ")}`,
  }),
  env: z.enum(DOMAIN_ENVIRONMENTS, {
    message: `Environment must be one of: ${DOMAIN_ENVIRONMENTS.join(", ")}`,
  }),
});

// Validation schema for validate endpoint query
export const validateDomainQuerySchema = z.object({
  domain: z.string().min(1, "Domain is required"),
  environment: z.enum(DOMAIN_ENVIRONMENTS, {
    message: `Environment must be one of: ${DOMAIN_ENVIRONMENTS.join(", ")}`,
  }),
  purpose: z.enum(DOMAIN_PURPOSES, {
    message: `Purpose must be one of: ${DOMAIN_PURPOSES.join(", ")}`,
  }),
});

export type CreateDomain = z.infer<typeof domainSchemaZod>;
export type DomainPurpose = "cors" | "passkey" | "oauth" | "api" | "admin" | "auth";
