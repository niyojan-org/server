import { AuthenticatedRequest } from "@core/middlewares/auth.middleware";
import { OrganizationRepository } from "../persistence/organization.repository";
import writeOrganizationAudit from "../../../audits/organization.audit";
import z from "zod";
import { sendOrganizationEmail } from "@infra/mail";
import { Severity } from "../types";
import ApiError from "@core/errors/api.error";

const blockOrganization = async (req: AuthenticatedRequest) => {
  const { orgId } = z.object({ orgId: z.string() }).parse(req.params);
  const { reason } = z
    .object({
      reason: z
        .string({ message: "Reason must be between 10 and 500 characters" })
        .min(10)
        .max(500),
    })
    .parse(req.body);
  const organization = await OrganizationRepository.find(orgId);
  organization.blockReason = reason;
  organization.blockedAt = new Date();
  organization.isBlocked = true;
  await sendOrganizationEmail.organizationBlocked(organization.email, {
    ownerName: await OrganizationRepository.getOwnerName(organization),
    organizationName: organization.name,
    blockReason: reason,
    appealUrl: `https://admin.orgatick.in/appeal/${organization._id}`,
    appealProcess: "To appeal this decision, please reply to this email with your justification.",
  });
  writeOrganizationAudit({
    organizationId: organization._id.toString(),
    actorUserId: req.user!._id.toString(),
    actorRole: req.user!.organization?.role ?? "system",
    action: "ORGANIZATION_BLOCKED",
    severity: "warning",
    targetType: "organization",
    targetId: organization._id.toString(),
    metadata: {
      message: `Organization ${organization.name} blocked by ${req.user!.name}`,
    },
    req,
  });
  await organization.save();
};

const unblockOrganization = async (req: AuthenticatedRequest) => {
  const { orgId } = z.object({ orgId: z.string() }).parse(req.params);
  const organization = await OrganizationRepository.find(orgId);
  organization.blockReason = null;
  organization.blockedAt = null;
  organization.isBlocked = false;
  await sendOrganizationEmail.organizationUnblocked(organization.email, {
    ownerName: await OrganizationRepository.getOwnerName(organization),
    organizationName: organization.name,
    dashboardUrl: `https://admin.orgatick.in`,
  });
  writeOrganizationAudit({
    organizationId: organization._id.toString(),
    actorUserId: req.user!._id.toString(),
    actorRole: req.user!.organization?.role ?? "system",
    action: "ORGANIZATION_UNBLOCKED",
    severity: "info",
    targetType: "organization",
    targetId: organization._id.toString(),
    metadata: {
      message: `Organization ${organization.name} unblocked by ${req.user!.name}`,
    },
    req,
  });
  await organization.save();
};

const addFraudFlag = async (req: AuthenticatedRequest) => {
  const { orgId } = z.object({ orgId: z.string() }).parse(req.params);
  const { reason, severity } = z
    .object({
      reason: z
        .string()
        .min(10, "Reason must be between 10 and 200 characters")
        .max(200, "Reason must be between 10 and 200 characters"),
      severity: z.enum(Object.values(Severity) as [string, ...string[]]),
    })
    .parse(req.body);

  const organization = await OrganizationRepository.find(orgId);
  organization.fraudFlags.push({
    reason,
    flaggedAt: new Date(),
    flaggedBy: req.user!._id,
    severity: severity ?? "minor",
    resolved: false,
  });
  await sendOrganizationEmail.organizationRiskEscalated(organization.email, {
    ownerName: await OrganizationRepository.getOwnerName(organization),
    organizationName: organization.name,
    riskLevel: severity || "minor",
    escalationReason: reason,
    responseDeadline: "Please respond within 7 days to avoid further actions.",
    urgentContactUrl: `https://admin.orgatick.in/support`,
    temporaryRestrictions:
      severity === "critical"
        ? "Your organization has been temporarily restricted due to critical fraud concerns."
        : "Please review your organization's activities to ensure compliance with our policies.",
  });
  writeOrganizationAudit({
    organizationId: organization._id.toString(),
    actorUserId: req.user!._id.toString(),
    actorRole: req.user!.organization?.role ?? "system",
    action: "FRAUD_FLAG_ADDED",
    severity: "warning",
    targetType: "organization",
    targetId: organization._id.toString(),
    metadata: {
      message: `Fraud flag added to organization ${organization.name} by ${req.user!.name}`,
      reason,
    },
    req,
  });
  await organization.save();
};

const resolveFraudFlag = async (req: AuthenticatedRequest) => {
  const { orgId, flagId } = z
    .object({
      orgId: z.string("Organization ID must be a string"),
      flagId: z.string("Flag ID must be a string"),
    })
    .parse(req.params);
  const { feedback } = z.object({ feedback: z.string() }).parse(req.body);
  const organization = await OrganizationRepository.find(orgId);
  const flag = organization.fraudFlags.find((flag) => flag._id!.toString() === flagId);
  if (!flag) throw new ApiError(404, "Flag not found", "FLAG_NOT_FOUND", "Flag not found");
  flag.resolved = true;
  flag.resolvedAt = new Date();
  flag.resolvedBy = req.user!._id;
  flag.resolvedFeedback = feedback;
  await organization.save();
  //TODO need to add email for resolved flag
  writeOrganizationAudit({
    organizationId: organization._id.toString(),
    actorRole: "taskmaster",
    actorUserId: req.user!._id.toString(),
    action: "FRAUD_FLAG_RESOLVED",
    severity: "critical",
    targetType: "organization",
    targetId: organization._id.toString(),
    metadata: {
      message: `Fraud flag resolved for organization ${organization.name} by ${req.user!.name}`,
      flagId,
      feedback,
    },
    req,
  });
};

const addWarning = async (req: AuthenticatedRequest) => {
  const { orgId } = z.object({ orgId: z.string() }).parse(req.params);
  const { message } = z
    .object({
      message: z.string().min(10).max(500),
    })
    .parse(req.body);

  const organization = await OrganizationRepository.find(orgId);
  organization.warnings.push({
    message,
    issuedAt: new Date(),
    issuedBy: req.user!._id,
    acknowledged: false,
  });
  writeOrganizationAudit({
    organizationId: organization._id.toString(),
    actorUserId: req.user!._id.toString(),
    actorRole: req.user!.organization?.role ?? "system",
    action: "ORGANIZATION_WARNING_ADDED",
    severity: "warning",
    targetType: "organization",
    targetId: organization._id.toString(),
    metadata: {
      message: `Warning added to organization ${organization.name} by ${req.user!.name}`,
      warningMessage: message,
    },
    req,
  });
  await organization.save();
};

const OrganizationModeration = {
  blockOrganization,
  unblockOrganization,
  addFraudFlag,
  resolveFraudFlag,
  addWarning,
};

export default OrganizationModeration;
