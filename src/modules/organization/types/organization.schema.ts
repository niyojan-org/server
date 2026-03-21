import { objectIdSchema } from "@helpers/zod";
import z from "zod";
import * as OrganizationEnums from "./organization.enums";
import {
  AddressSchema,
  DocumentSchema,
  SocialLinksSchema,
  SupportContactSchema,
} from "./organization.create.schema";
import { OrganizationBankSchema, PaymentGatewaysSchema } from "./organization.bank.schema";

export const FraudFlagSchema = z.object({
  _id: objectIdSchema.optional(),
  reason: z.string().min(10).max(500),
  flaggedAt: z.date().default(new Date()),
  flaggedBy: objectIdSchema,
  severity: z
    .enum(Object.values(OrganizationEnums.Severity) as [string, ...string[]])
    .default(OrganizationEnums.Severity.MINOR),
  resolvedFeedback: z.string().min(10).max(500).nullable().optional(),
  resolved: z.boolean().default(false),
  resolvedBy: objectIdSchema.nullable().optional(),
  resolvedAt: z.date().nullable().optional(),
});

export const WarningSchema = z.object({
  message: z.string().min(10).max(500),
  issuedAt: z.date().default(new Date()),
  issuedBy: objectIdSchema,
  acknowledged: z.boolean().default(false),
});

export const StatsSchema = z.object({
  totalEventsHosted: z.number().default(0),
});

const organizationSchema = z.object({
  _id: objectIdSchema.optional(),
  name: z.string().min(3).max(100),
  slug: z.string().min(3).max(100).optional(),
  category: z.enum(Object.values(OrganizationEnums.OrganizationCategory)),
  subCategory: z.string().min(2).max(100).optional(),
  description: z.string().min(10).max(1000).optional(),
  logo: z.url().optional(),
  email: z.email().toLowerCase().trim(),
  phone: z.string().min(10).max(15),

  address: AddressSchema,
  supportContact: SupportContactSchema,
  socialLinks: SocialLinksSchema,
  owner: objectIdSchema,
  verified: z.boolean().default(false),
  verifiedAt: z.date().nullable().optional(),
  verifiedBy: objectIdSchema.nullable().optional(),
  reqForVerification: z.boolean().default(false).optional(),
  rejectionReason: z.string().min(10).max(500).nullable().optional(),
  trustScore: z.number().min(0).max(100).default(100),
  active: z.boolean().default(true),
  allowsEventCreation: z.boolean().default(true),

  fraudFlags: z.array(FraudFlagSchema).max(10).default([]),
  warnings: z.array(WarningSchema).max(10).default([]),

  isBlocked: z.boolean().default(false),
  blockReason: z.string().min(10).max(500).nullable().optional(),
  blockType: z.enum(Object.values(OrganizationEnums.BlockType)).nullable().optional(),
  blockedBy: objectIdSchema.nullable().optional(),
  blockedAt: z.date().nullable().optional(),

  allowsPaidEvents: z.boolean().default(false),

  bankDetails: OrganizationBankSchema.optional(),
  paymentGateways: PaymentGatewaysSchema.optional(),

  stats: StatsSchema,

  documents: z.array(DocumentSchema).min(1),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export type Organization = z.infer<typeof organizationSchema>;
export default organizationSchema;
