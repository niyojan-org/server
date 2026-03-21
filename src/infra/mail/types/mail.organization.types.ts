import z from "zod";
import { OrganizationSchema } from "../schema";

export type OrganizationCreatedType = z.infer<typeof OrganizationSchema.organizationCreatedSchema>;
export type OrganizationVerificationRequestedType = z.infer<
  typeof OrganizationSchema.organizationVerificationRequestedSchema
>;
export type OrganizationVerifiedType = z.infer<
  typeof OrganizationSchema.organizationVerifiedSchema
>;
export type OrganizationVerificationRejectedType = z.infer<
  typeof OrganizationSchema.organizationVerificationRejectedSchema
>;

export type OrganizationMemberInvitedType = z.infer<
  typeof OrganizationSchema.organizationMemberInvitedSchema
>;
export type OrganizationInvitationAcceptedType = z.infer<
  typeof OrganizationSchema.organizationInvitationAcceptedSchema
>;
export type OrganizationMemberRoleChangedType = z.infer<
  typeof OrganizationSchema.organizationMemberRoleChangedSchema
>;
export type OrganizationMemberRemovedType = z.infer<
  typeof OrganizationSchema.organizationMemberRemovedSchema
>;
export type OrganizationInvitationReminderType = z.infer<
  typeof OrganizationSchema.organizationInvitationReminderSchema
>;
export type OrganizationInvitationRevokedType = z.infer<
  typeof OrganizationSchema.organizationInvitationRevokedSchema
>;

export type OrganizationBankSubmittedType = z.infer<
  typeof OrganizationSchema.organizationBankSubmittedSchema
>;
export type OrganizationBankVerifiedType = z.infer<
  typeof OrganizationSchema.organizationBankVerifiedSchema
>;
export type OrganizationBankRejectedType = z.infer<
  typeof OrganizationSchema.organizationBankRejectedSchema
>;

export type OrganizationPaymentSubmittedType = z.infer<
  typeof OrganizationSchema.organizationPaymentSubmittedSchema
>;
export type OrganizationPaymentVerifiedType = z.infer<
  typeof OrganizationSchema.organizationPaymentVerifiedSchema
>;
export type OrganizationPaymentRejectedType = z.infer<
  typeof OrganizationSchema.organizationPaymentRejectedSchema
>;
export type OrganizationPaidEventsEnabledType = z.infer<
  typeof OrganizationSchema.organizationPaidEventsEnabledSchema
>;

export type OrganizationBlockedType = z.infer<typeof OrganizationSchema.organizationBlockedSchema>;
export type OrganizationUnblockedType = z.infer<
  typeof OrganizationSchema.organizationUnblockedSchema
>;
export type OrganizationWarningIssuedType = z.infer<
  typeof OrganizationSchema.organizationWarningIssuedSchema
>;
export type OrganizationRiskEscalatedType = z.infer<
  typeof OrganizationSchema.organizationRiskEscalatedSchema
>;
