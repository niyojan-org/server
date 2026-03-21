import mailQueue from "@queues/mail.queue";
import { OrganizationType } from "../types";
import { EMAIL_SENDERS, EMAIL_LAYOUTS } from "../mail.constants";

const sendOrganizationEmail = {
  organizationCreated: async (to: string, context: OrganizationType.OrganizationCreatedType) => {
    await mailQueue.add("template", {
      template: "organization/organization-created",
      layout: EMAIL_LAYOUTS.BASE,
      from: EMAIL_SENDERS.AUTH,
      to,
      subject: `Welcome to Orgatick, ${context.organizationName}!`,
      data: context,
    });
  },

  organizationVerificationRequested: async (
    to: string,
    context: OrganizationType.OrganizationVerificationRequestedType,
  ) => {
    await mailQueue.add("template", {
      template: "organization/organization-verification-requested",
      layout: EMAIL_LAYOUTS.BASE,
      from: EMAIL_SENDERS.AUTH,
      to,
      subject: "Verification Request Received",
      data: context,
    });
  },

  organizationVerified: async (to: string, context: OrganizationType.OrganizationVerifiedType) => {
    await mailQueue.add("template", {
      template: "organization/organization-verified",
      layout: EMAIL_LAYOUTS.BASE,
      from: EMAIL_SENDERS.AUTH,
      to,
      subject: "Your Organization is Now Verified!",
      data: context,
    });
  },

  organizationVerificationRejected: async (
    to: string,
    context: OrganizationType.OrganizationVerificationRejectedType,
  ) => {
    await mailQueue.add("template", {
      template: "organization/organization-verification-rejected",
      layout: EMAIL_LAYOUTS.BASE,
      from: EMAIL_SENDERS.AUTH,
      to,
      subject: "Verification Request Update",
      data: context,
    });
  },

  // Membership & Roles (5-10)

  organizationMemberInvited: async (
    to: string,
    context: OrganizationType.OrganizationMemberInvitedType,
  ) => {
    await mailQueue.add("template", {
      template: "organization/organization-member-invited",
      layout: EMAIL_LAYOUTS.BASE,
      from: EMAIL_SENDERS.AUTH,
      to,
      subject: `You've Been Invited to Join ${context.organizationName}`,
      data: context,
    });
  },

  organizationInvitationAccepted: async (
    to: string,
    context: OrganizationType.OrganizationInvitationAcceptedType,
  ) => {
    await mailQueue.add("template", {
      template: "organization/organization-invitation-accepted",
      layout: EMAIL_LAYOUTS.BASE,
      from: EMAIL_SENDERS.AUTH,
      to,
      subject: "New Member Joined Your Organization",
      data: context,
    });
  },

  organizationMemberRoleChanged: async (
    to: string,
    context: OrganizationType.OrganizationMemberRoleChangedType,
  ) => {
    await mailQueue.add("template", {
      template: "organization/organization-member-role-changed",
      layout: EMAIL_LAYOUTS.BASE,
      from: EMAIL_SENDERS.AUTH,
      to,
      subject: "Your Role Has Been Updated",
      data: context,
    });
  },

  organizationMemberRemoved: async (
    to: string,
    context: OrganizationType.OrganizationMemberRemovedType,
  ) => {
    await mailQueue.add("template", {
      template: "organization/organization-member-removed",
      layout: EMAIL_LAYOUTS.BASE,
      from: EMAIL_SENDERS.AUTH,
      to,
      subject: `You've Been Removed from ${context.organizationName}`,
      data: context,
    });
  },

  organizationInvitationReminder: async (
    to: string,
    context: OrganizationType.OrganizationInvitationReminderType,
  ) => {
    await mailQueue.add("template", {
      template: "organization/organization-invitation-reminder",
      layout: EMAIL_LAYOUTS.BASE,
      from: EMAIL_SENDERS.AUTH,
      to,
      subject: `Reminder: Invitation to Join ${context.organizationName}`,
      data: context,
    });
  },

  organizationInvitationRevoked: async (
    to: string,
    context: OrganizationType.OrganizationInvitationRevokedType,
  ) => {
    await mailQueue.add("template", {
      template: "organization/organization-invitation-revoked",
      layout: EMAIL_LAYOUTS.BASE,
      from: EMAIL_SENDERS.AUTH,
      to,
      subject: "Invitation Cancelled",
      data: context,
    });
  },

  // Bank Verification

  organizationBankSubmitted: async (
    to: string,
    context: OrganizationType.OrganizationBankSubmittedType,
  ) => {
    await mailQueue.add("template", {
      template: "organization/organization-bank-submitted",
      layout: EMAIL_LAYOUTS.BASE,
      from: EMAIL_SENDERS.AUTH,
      to,
      subject: "Bank Details Submitted for Verification",
      data: context,
    });
  },

  organizationBankVerified: async (
    to: string,
    context: OrganizationType.OrganizationBankVerifiedType,
  ) => {
    await mailQueue.add("template", {
      template: "organization/organization-bank-verified",
      layout: EMAIL_LAYOUTS.BASE,
      from: EMAIL_SENDERS.AUTH,
      to,
      subject: "Bank Details Verified!",
      data: context,
    });
  },

  organizationBankRejected: async (
    to: string,
    context: OrganizationType.OrganizationBankRejectedType,
  ) => {
    await mailQueue.add("template", {
      template: "organization/organization-bank-rejected",
      layout: EMAIL_LAYOUTS.BASE,
      from: EMAIL_SENDERS.AUTH,
      to,
      subject: "Bank Verification Update Required",
      data: context,
    });
  },

  // Payment & Events

  organizationPaymentSubmitted: async (
    to: string,
    context: OrganizationType.OrganizationPaymentSubmittedType,
  ) => {
    await mailQueue.add("template", {
      template: "organization/organization-payment-submitted",
      layout: EMAIL_LAYOUTS.BASE,
      from: EMAIL_SENDERS.AUTH,
      to,
      subject: "Payment Details Submitted",
      data: context,
    });
  },

  organizationPaymentVerified: async (
    to: string,
    context: OrganizationType.OrganizationPaymentVerifiedType,
  ) => {
    await mailQueue.add("template", {
      template: "organization/organization-payment-verified",
      layout: EMAIL_LAYOUTS.BASE,
      from: EMAIL_SENDERS.AUTH,
      to,
      subject: "Payment Details Verified!",
      data: context,
    });
  },

  organizationPaymentRejected: async (
    to: string,
    context: OrganizationType.OrganizationPaymentRejectedType,
  ) => {
    await mailQueue.add("template", {
      template: "organization/organization-payment-rejected",
      layout: EMAIL_LAYOUTS.BASE,
      from: EMAIL_SENDERS.AUTH,
      to,
      subject: "Payment Verification Failed",
      data: context,
    });
  },

  organizationPaidEventsEnabled: async (
    to: string,
    context: OrganizationType.OrganizationPaidEventsEnabledType,
  ) => {
    await mailQueue.add("template", {
      template: "organization/organization-paid-events-enabled",
      layout: EMAIL_LAYOUTS.BASE,
      from: EMAIL_SENDERS.AUTH,
      to,
      subject: "Paid Events Enabled!",
      data: context,
    });
  },

  organizationBlocked: async (to: string, context: OrganizationType.OrganizationBlockedType) => {
    await mailQueue.add("template", {
      template: "organization/organization-blocked",
      layout: EMAIL_LAYOUTS.BASE,
      from: EMAIL_SENDERS.AUTH,
      to,
      subject: "Organization Blocked - Action Required",
      data: context,
    });
  },

  organizationUnblocked: async (
    to: string,
    context: OrganizationType.OrganizationUnblockedType,
  ) => {
    await mailQueue.add("template", {
      template: "organization/organization-unblocked",
      layout: EMAIL_LAYOUTS.BASE,
      from: EMAIL_SENDERS.AUTH,
      to,
      subject: "Organization Unblocked!",
      data: context,
    });
  },

  organizationWarningIssued: async (
    to: string,
    context: OrganizationType.OrganizationWarningIssuedType,
  ) => {
    await mailQueue.add("template", {
      template: "organization/organization-warning-issued",
      layout: EMAIL_LAYOUTS.BASE,
      from: EMAIL_SENDERS.AUTH,
      to,
      subject: "Important: Platform Warning",
      data: context,
    });
  },

  organizationRiskEscalated: async (
    to: string,
    context: OrganizationType.OrganizationRiskEscalatedType,
  ) => {
    await mailQueue.add("template", {
      template: "organization/organization-risk-escalated",
      layout: EMAIL_LAYOUTS.BASE,
      from: EMAIL_SENDERS.AUTH,
      to,
      subject: "Urgent: Risk Level Escalated - Immediate Action Required",
      data: context,
    });
  },
};

export default sendOrganizationEmail;
