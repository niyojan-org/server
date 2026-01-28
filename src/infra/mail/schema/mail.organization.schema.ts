import z from "zod";

export const organizationCreatedSchema = z.object({
  ownerName: z.string(),
  organizationName: z.string(),
  dashboardUrl: z.string(),
});

export const organizationVerificationRequestedSchema = z.object({
  ownerName: z.string(),
  organizationName: z.string(),
  submittedDate: z.string(),
});

export const organizationVerifiedSchema = z.object({
  ownerName: z.string(),
  organizationName: z.string(),
  organizationUrl: z.string(),
});

export const organizationVerificationRejectedSchema = z.object({
  ownerName: z.string(),
  organizationName: z.string(),
  rejectionReason: z.string(),
  reapplyUrl: z.string(),
});

export const organizationMemberInvitedSchema = z.object({
  inviteeName: z.string(),
  inviterName: z.string(),
  organizationName: z.string(),
  role: z.string(),
  roleDescription: z.string().optional(),
  acceptInvitationUrl: z.string(),
  expiryDays: z.string().default("7"),
});

export const organizationInvitationAcceptedSchema = z.object({
  ownerName: z.string(),
  memberName: z.string(),
  memberEmail: z.string(),
  organizationName: z.string(),
  role: z.string(),
  memberManagementUrl: z.string(),
});

export const organizationMemberRoleChangedSchema = z.object({
  memberName: z.string(),
  organizationName: z.string(),
  changedBy: z.string(),
  oldRole: z.string(),
  newRole: z.string(),
  newRoleDescription: z.string().optional(),
  organizationUrl: z.string(),
});

export const organizationMemberRemovedSchema = z.object({
  memberName: z.string(),
  organizationName: z.string(),
  removedBy: z.string(),
  removalReason: z.string().optional(),
});

export const organizationInvitationReminderSchema = z.object({
  inviteeName: z.string(),
  inviterName: z.string(),
  organizationName: z.string(),
  role: z.string(),
  acceptInvitationUrl: z.string(),
  daysRemaining: z.string(),
});

export const organizationInvitationRevokedSchema = z.object({
  inviteeName: z.string(),
  organizationName: z.string(),
  revokedBy: z.string(),
  revocationReason: z.string().optional(),
});

export const organizationPaymentSubmittedSchema = z.object({
  ownerName: z.string(),
  organizationName: z.string(),
  submittedDate: z.string(),
  paymentMethod: z.string().optional(),
  accountDetails: z.string().optional(),
  dashboardUrl: z.string(),
});

export const organizationPaymentVerifiedSchema = z.object({
  ownerName: z.string(),
  organizationName: z.string(),
  createEventUrl: z.string(),
});

export const organizationPaymentRejectedSchema = z.object({
  ownerName: z.string(),
  organizationName: z.string(),
  rejectionReason: z.string(),
  updatePaymentUrl: z.string(),
});

export const organizationPaidEventsEnabledSchema = z.object({
  ownerName: z.string(),
  organizationName: z.string(),
  createPaidEventUrl: z.string(),
});

export const organizationBlockedSchema = z.object({
  ownerName: z.string(),
  organizationName: z.string(),
  blockReason: z.string(),
  appealProcess: z.string().optional(),
  appealUrl: z.string(),
});

export const organizationUnblockedSchema = z.object({
  ownerName: z.string(),
  organizationName: z.string(),
  dashboardUrl: z.string(),
});

export const organizationWarningIssuedSchema = z.object({
  ownerName: z.string(),
  organizationName: z.string(),
  warningDate: z.string(),
  warningDetails: z.string(),
  recommendedActions: z.string().optional(),
  contactSupportUrl: z.string(),
});

export const organizationRiskEscalatedSchema = z.object({
  ownerName: z.string(),
  organizationName: z.string(),
  riskLevel: z.string(), // e.g., "HIGH" or "CRITICAL"
  escalationReason: z.string(),
  temporaryRestrictions: z.string().optional(),
  responseDeadline: z.string(),
  urgentContactUrl: z.string(),
});
