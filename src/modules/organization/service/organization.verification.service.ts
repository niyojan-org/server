import ApiError from "@core/errors/api.error";
import { OrganizationRequest } from "@core/middlewares/organization.middleware";
import { OrganizationRepository } from "../persistence/organization.repository";
import { OrganizationCreateSchema } from "../types";
import { sendOrganizationEmail } from "@infra/mail";
import { AuthenticatedRequest } from "@core/middlewares/auth.middleware";
import UserModel from "@modules/user/user.model";
import writeOrganizationAudit from "../../../audits/organization.audit";
import OrganizationModel from "../persistence/organization.model";

export const raiseOrgVerification = async (req: OrganizationRequest) => {
  if (req.organization?.reqForVerification) {
    throw new ApiError(
      400,
      "Verification request already raised.",
      "VERIFICATION_REQUEST_EXISTS",
      "A verification request for this organization is already pending, please wait for review.",
    );
  }
  const updated = await OrganizationRepository.updateById(
    req.organization._id,
    req.body
      ? { ...OrganizationCreateSchema.partial().parse(req.body), reqForVerification: true }
      : { reqForVerification: true },
  );
  await sendOrganizationEmail.organizationVerificationRequested(req.user!.email, {
    ownerName: req.user!.name,
    organizationName: updated!.name,
    submittedDate: new Date().toDateString(),
  });
  writeOrganizationAudit({
    organizationId: req.organization._id.toString(),
    actorUserId: req.user!._id.toString(),
    actorRole: req.user!.organization?.role ?? "system",
    action: "ORGANIZATION_VERIFICATION_REQUESTED",
    severity: "info",
    targetType: "organization",
    targetId: req.organization._id.toString(),
    metadata: {
      message: `Verification request raised for organization ${req.organization.name} by ${req.user!.name}`,
    },
    req,
  });
};

export const verifyOrganization = async (organizationId: string, req: AuthenticatedRequest) => {
  const organization = await OrganizationRepository.findById(organizationId);
  if (!organization) {
    throw new ApiError(
      404,
      "Organization not found.",
      "ORGANIZATION_NOT_FOUND",
      "The organization you are trying to verify does not exist.",
    );
  }
  if (!organization.reqForVerification) {
    throw new ApiError(
      400,
      "No verification request to verify.",
      "NO_VERIFICATION_REQUEST",
      "There is no pending verification request for this organization to verify.",
    );
  }
  organization.verified = true;
  organization.verifiedAt = new Date();
  organization.verifiedBy = req.user!._id;
  organization.reqForVerification = undefined;
  organization.rejectionReason = undefined;
  await organization.save();
  const owner = await UserModel.findById(organization.owner);
  await sendOrganizationEmail.organizationVerified(organization.email, {
    ownerName: owner ? owner.name : "Unknown",
    organizationName: organization.name,
    organizationUrl: `https://admin.orgatick.in/organization`,
  });
  writeOrganizationAudit({
    organizationId: organization._id.toString(),
    actorUserId: req.user!._id.toString(),
    actorRole: "taskmaster",
    action: "ORGANIZATION_VERIFIED",
    severity: "info",
    targetType: "organization",
    targetId: organization._id.toString(),
    metadata: {
      message: `Organization ${organization.name} verified by ${req.user!.name}`,
    },
    req,
  });
};

export const rejectOrganizationVerification = async (
  organizationId: string,
  req: AuthenticatedRequest,
  reason: string,
) => {
  const organization = await OrganizationRepository.findById(organizationId);
  if (!organization) {
    throw new ApiError(
      404,
      "Organization not found.",
      "ORGANIZATION_NOT_FOUND",
      "The organization you are trying to reject verification for does not exist.",
    );
  }
  if (!organization.reqForVerification) {
    throw new ApiError(
      400,
      "No verification request to reject.",
      "NO_VERIFICATION_REQUEST",
      "There is no pending verification request for this organization to reject.",
    );
  }
  organization.reqForVerification = false;
  organization.rejectionReason = reason;
  await OrganizationRepository.updateById(organization._id, organization);
  await sendOrganizationEmail.organizationVerificationRejected(req.user!.email, {
    ownerName: req.user!.name,
    organizationName: organization.name,
    rejectionReason: reason,
    reapplyUrl: `https://admin.orgatick.in/organization/settings`,
  });
  writeOrganizationAudit({
    organizationId: organization._id.toString(),
    actorUserId: req.user!._id.toString(),
    actorRole: "taskmaster",
    action: "ORGANIZATION_VERIFICATION_REJECTED",
    severity: "info",
    targetType: "organization",
    targetId: organization._id.toString(),
    metadata: {
      message: `Verification request for organization ${organization.name} rejected by ${req.user!.name} for reason: ${reason}`,
    },
    req,
  });
};

export const getPendingVerifications = async (options: { limit: number; page: number }) => {
  const limit = options.limit;
  const page = options.page;
  const skip = (page - 1) * limit;
  return OrganizationModel.find({ reqForVerification: true, verified: false })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();
};

export const unverifyOrganization = async (organizationId: string, req: AuthenticatedRequest) => {
  const organization = await OrganizationRepository.findById(organizationId);
  if (!organization) {
    throw new ApiError(
      404,
      "Organization not found.",
      "ORGANIZATION_NOT_FOUND",
      "The organization you are trying to unverify does not exist.",
    );
  }
  if (!organization.verified) {
    throw new ApiError(
      400,
      "Organization is not verified.",
      "ORGANIZATION_NOT_VERIFIED",
      "The organization you are trying to unverify is not verified.",
    );
  }
  organization.verified = false;
  organization.verifiedAt = undefined;
  organization.verifiedBy = undefined;
  await organization.save();
  writeOrganizationAudit({
    organizationId: organization._id.toString(),
    actorUserId: req.user!._id.toString(),
    actorRole: "taskmaster",
    action: "ORGANIZATION_UNVERIFIED",
    severity: "info",
    targetType: "organization",
    targetId: organization._id.toString(),
    metadata: {
      message: `Organization ${organization.name} unverified by ${req.user!.name}`,
    },
    req,
  });
};

export const verifyDocument = async (
  organizationId: string,
  documentId: string,
  req: AuthenticatedRequest,
) => {
  const organization = await OrganizationRepository.find(organizationId);
  const document = organization.documents.find((doc) => doc._id!.toString() === documentId);
  if (!document) {
    throw new ApiError(
      404,
      "Document not found.",
      "DOCUMENT_NOT_FOUND",
      "The document you are trying to verify does not exist.",
    );
  }
  document.verified = true;
  document.verifiedAt = new Date();
  document.verifiedBy = req.user!._id;
  await organization.save();
};
