import ApiError from "@core/errors/api.error";
import { AuthenticatedRequest } from "@core/middlewares/auth.middleware";
import { OrganizationRepository } from "../../persistence/organization.repository";
import { sendOrganizationEmail } from "@infra/mail";
import UserModel from "@modules/user/user.model";
import writeOrganizationAudit from "../../../../audits/organization.audit";
import type * as VTypes from "../../types/verification.schemas";
import { ObjectId } from "@helpers/zod";

// verify org (taskmaster)
export const verifyOrganization = async (
  organizationId: ObjectId,
  req: AuthenticatedRequest,
  options: VTypes.VerifyOrg,
) => {
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
  organization.allowsEventCreation = options.allowEventCreation;
  await organization.save();

  const owner = await UserModel.findById(organization.owner);
  await sendOrganizationEmail.organizationVerified(owner?.email || organization.email, {
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
      allowsEventCreation: options.allowEventCreation,
    },
    req,
  });
};

// reject org verification (taskmaster)
export const rejectOrganizationVerification = async (
  organizationId: ObjectId,
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

// unverify org (admin/taskmaster)
export const unverifyOrganization = async (organizationId: ObjectId, req: AuthenticatedRequest) => {
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
