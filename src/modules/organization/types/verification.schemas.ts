import { objectIdSchema } from "@helpers/zod";
import { z } from "zod";

// param schemas
export const OrgIdParamSchema = z.object({
  orgId: objectIdSchema,
});

export const DocumentIdSchema = z.object({
  documentId: objectIdSchema,
});

// raise org verification
export const RaiseOrgVerificationSchema = z.object({
  // optional update fields before raising
  name: z.string().min(3).max(100).optional(),
  email: z.email().toLowerCase().trim().optional(),
  phone: z.string().min(10).max(15).optional(),
  description: z.string().min(10).max(1000).optional(),
  logo: z.url().optional(),
});

// verify org (taskmaster)
export const VerifyOrgSchema = z.object({
  allowEventCreation: z.boolean().default(true),
});

// reject org verification (taskmaster)
export const RejectOrgVerificationSchema = z.object({
  reason: z
    .string("Rejection reason is required.")
    .min(10, "Rejection reason must be at least 10 characters.")
    .max(500, "Rejection reason must be at most 500 characters."),
});

// raise bank verification
export const RaiseBankVerificationSchema = z.object({
  // flag to indicate request
  requestVerification: z.boolean().default(true),
});

// verify bank details (taskmaster)
export const VerifyBankDetailsSchema = z.object({
  allowPaidEvents: z.boolean().default(false),
});

// reject bank verification (taskmaster)
export const RejectBankVerificationSchema = z.object({
  reason: z.string().min(10).max(500),
});

// document verification (taskmaster)
export const VerifyDocumentSchema = z.object({
  documentId: objectIdSchema,
});

// reject document (taskmaster)
export const RejectDocumentSchema = z.object({
  documentId: objectIdSchema,
  reason: z.string().min(10).max(500),
});

// query pending verifications
export const PendingVerificationsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  type: z.enum(["organization", "bank", "document", "all"]).default("all"),
});

// types
export type RaiseOrgVerification = z.infer<typeof RaiseOrgVerificationSchema>;
export type VerifyOrg = z.infer<typeof VerifyOrgSchema>;
export type RejectOrgVerification = z.infer<typeof RejectOrgVerificationSchema>;
export type RaiseBankVerification = z.infer<typeof RaiseBankVerificationSchema>;
export type VerifyBankDetails = z.infer<typeof VerifyBankDetailsSchema>;
export type RejectBankVerification = z.infer<typeof RejectBankVerificationSchema>;
export type VerifyDocument = z.infer<typeof VerifyDocumentSchema>;
export type RejectDocument = z.infer<typeof RejectDocumentSchema>;
export type PendingVerificationsQuery = z.infer<typeof PendingVerificationsQuerySchema>;
