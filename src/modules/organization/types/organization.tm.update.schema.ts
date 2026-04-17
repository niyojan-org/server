import { objectIdSchema } from '@helpers/zod';
import z from 'zod';
import * as OrganizationEnums from './organization.enums';
import {
  AddressSchema,
  DocumentSchema,
  SocialLinksSchema,
  SupportContactSchema,
} from './organization.create.schema';
import {
  OrganizationBankSchema,
  PaymentGatewaysSchema,
} from './organization.bank.schema';
import { userZodSchema } from '@modules/user/user.schema';

export const FraudFlagSchema = z.object({
  _id: objectIdSchema.optional(),
  reason: z.string().min(10).max(500),
  flaggedAt: z.date(),
  flaggedBy: objectIdSchema,
  severity: z.enum(
    Object.values(OrganizationEnums.Severity) as [string, ...string[]],
  ),
  resolvedFeedback: z.string().min(10).max(500).nullable().optional(),
  resolved: z.boolean(),
  resolvedBy: objectIdSchema.nullable().optional(),
  resolvedAt: z.date().nullable().optional(),
});

export const WarningSchema = z.object({
  message: z.string().min(10).max(500),
  issuedAt: z.date(),
  issuedBy: objectIdSchema,
  acknowledged: z.boolean(),
});

export const StatsSchema = z.object({
  totalEventsHosted: z.number(),
});

const organizationTmUpdateSchema = z.object({
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
  owner: z.union([objectIdSchema, userZodSchema]),
  verified: z.boolean(),
  verifiedAt: z.date().nullable().optional(),
  verifiedBy: objectIdSchema.nullable().optional(),
  reqForVerification: z.boolean().optional(),
  rejectionReason: z.string().min(10).max(500).nullable().optional(),
  trustScore: z.number().min(0).max(100),
  active: z.boolean(),
  allowsEventCreation: z.boolean(),

  fraudFlags: z.array(FraudFlagSchema).max(10),
  warnings: z.array(WarningSchema).max(10),

  isBlocked: z.boolean(),
  blockReason: z.string().min(10).max(500).nullable().optional(),
  blockType: z
    .enum(Object.values(OrganizationEnums.BlockType))
    .nullable()
    .optional(),
  blockedBy: objectIdSchema.nullable().optional(),
  blockedAt: z.date().nullable().optional(),

  allowsPaidEvents: z.boolean(),

  bankDetails: OrganizationBankSchema.optional(),
  paymentGateways: PaymentGatewaysSchema.optional(),

  stats: StatsSchema,

  documents: z.array(DocumentSchema).min(1),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export type Organization = z.infer<typeof organizationTmUpdateSchema>;
export default organizationTmUpdateSchema;
