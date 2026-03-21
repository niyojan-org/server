import ApiError from "@core/errors/api.error";
import { OrganizationRequest } from "@core/middlewares/organization.middleware";
import { AuthenticatedRequest } from "@core/middlewares/auth.middleware";
import { OrganizationRepository } from "../../persistence/organization.repository";
import { sendOrganizationEmail } from "@infra/mail";
import UserModel from "@modules/user/user.model";
import writeOrganizationAudit from "../../../../audits/organization.audit";
import type * as VTypes from "../../types/verification.schemas";
import { checkBankDataValidity } from "./validators";
import { ObjectId } from "@helpers/zod";

// raise bank verification request
export const raiseBankVerification = async (req: OrganizationRequest) => {
  if (!req.organization?.bankDetails) {
    throw new ApiError(
      400,
      "No bank details found.",
      "NO_BANK_DETAILS",
      "Please add bank details before requesting verification.",
    );
  }

  if (req.organization.bankDetails.reqForVerification) {
    throw new ApiError(
      400,
      "Bank verification request already raised.",
      "BANK_VERIFICATION_REQUEST_EXISTS",
      "A bank verification request is already pending, please wait for review.",
    );
  }

  if (req.organization.bankDetails.verified) {
    throw new ApiError(
      400,
      "Bank details already verified.",
      "ALREADY_VERIFIED",
      "Bank details are already verified.",
    );
  }

  // validate bank data
  const dataCheck = checkBankDataValidity(req.organization.bankDetails);
  if (!dataCheck.valid) {
    throw new ApiError(
      400,
      "Incomplete bank details.",
      "INCOMPLETE_BANK_DATA",
      `Missing required fields: ${dataCheck.missing.join(", ")}`,
    );
  }

  const organization = await OrganizationRepository.findById(req.organization._id);
  if (organization && organization.bankDetails) {
    organization.bankDetails.reqForVerification = true;
    await organization.save();
  }

  const owner = await UserModel.findById(req.organization.owner);
  await sendOrganizationEmail.organizationBankSubmitted(owner?.email || req.organization.email, {
    ownerName: owner ? owner.name : "Unknown",
    organizationName: req.organization.name,
    submittedDate: new Date().toLocaleDateString(),
    bankName: req.organization.bankDetails.bankName,
    accountNumber: req.organization.bankDetails.accountNumber?.replace(/.(?=.{4})/g, '*'),
    dashboardUrl: `https://admin.orgatick.in/organization`,
  });

  writeOrganizationAudit({
    organizationId: req.organization._id.toString(),
    actorUserId: req.user!._id.toString(),
    actorRole: req.user!.organization?.role ?? "system",
    action: "BANK_VERIFICATION_REQUESTED",
    severity: "info",
    targetType: "organization",
    targetId: req.organization._id.toString(),
    metadata: {
      message: `Bank verification request raised for ${req.organization.name} by ${req.user!.name}`,
    },
    req,
  });
};

// verify bank details (taskmaster)
export const verifyBankDetails = async (
  organizationId: ObjectId,
  req: AuthenticatedRequest,
  options: VTypes.VerifyBankDetails,
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

  if (!organization.bankDetails) {
    throw new ApiError(
      400,
      "No bank details found.",
      "NO_BANK_DETAILS",
      "No bank details available for verification.",
    );
  }

  if (!organization.bankDetails.reqForVerification) {
    throw new ApiError(
      400,
      "No bank verification request.",
      "NO_BANK_VERIFICATION_REQUEST",
      "There is no pending bank verification request.",
    );
  }

  organization.bankDetails.verified = true;
  organization.bankDetails.verifiedAt = new Date();
  organization.bankDetails.verifiedBy = req.user!._id;
  organization.bankDetails.reqForVerification = false;
  organization.bankDetails.rejectionReason = undefined;
  organization.allowsPaidEvents = options.allowPaidEvents;

  await organization.save();

  const owner = await UserModel.findById(organization.owner);
  await sendOrganizationEmail.organizationBankVerified(owner?.email || organization.email, {
    ownerName: owner ? owner.name : "Unknown",
    organizationName: organization.name,
    allowsPaidEvents: options.allowPaidEvents,
    createEventUrl: `https://admin.orgatick.in/organization/events/create`,
  });

  writeOrganizationAudit({
    organizationId: organization._id.toString(),
    actorUserId: req.user!._id.toString(),
    actorRole: "taskmaster",
    action: "BANK_DETAILS_VERIFIED",
    severity: "info",
    targetType: "organization",
    targetId: organization._id.toString(),
    metadata: {
      message: `Bank details verified for ${organization.name} by ${req.user!.name}`,
      allowsPaidEvents: options.allowPaidEvents,
    },
    req,
  });
};

// reject bank verification (taskmaster)
export const rejectBankVerification = async (
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
      "The organization you are trying to reject does not exist.",
    );
  }

  if (!organization.bankDetails) {
    throw new ApiError(
      400,
      "No bank details found.",
      "NO_BANK_DETAILS",
      "No bank details available.",
    );
  }

  if (!organization.bankDetails.reqForVerification) {
    throw new ApiError(
      400,
      "No bank verification request.",
      "NO_BANK_VERIFICATION_REQUEST",
      "There is no pending bank verification request to reject.",
    );
  }

  organization.bankDetails.reqForVerification = false;
  organization.bankDetails.rejectionReason = reason;

  await organization.save();

  const owner = await UserModel.findById(organization.owner);
  await sendOrganizationEmail.organizationBankRejected(owner?.email || organization.email, {
    ownerName: owner ? owner.name : "Unknown",
    organizationName: organization.name,
    rejectionReason: reason,
    updateBankUrl: `https://admin.orgatick.in/organization/settings/bank`,
  });

  writeOrganizationAudit({
    organizationId: organization._id.toString(),
    actorUserId: req.user!._id.toString(),
    actorRole: "taskmaster",
    action: "BANK_VERIFICATION_REJECTED",
    severity: "info",
    targetType: "organization",
    targetId: organization._id.toString(),
    metadata: {
      message: `Bank verification rejected for ${organization.name} by ${req.user!.name}`,
      reason,
    },
    req,
  });
};
