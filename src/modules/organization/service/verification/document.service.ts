import ApiError from "@core/errors/api.error";
import { AuthenticatedRequest } from "@core/middlewares/auth.middleware";
import { OrganizationRepository } from "../../persistence/organization.repository";
import writeOrganizationAudit from "../../../../audits/organization.audit";
import { ObjectId } from "@helpers/zod";

// verify document (taskmaster)
export const verifyDocument = async (
  organizationId: ObjectId,
  documentId: ObjectId,
  req: AuthenticatedRequest,
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

  const document = organization.documents.find((doc) => doc._id!.toString() === documentId.toString());
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
  document.rejected = false;
  document.rejectionReason = undefined;
  document.checkedBy = req.user!._id.toString();

  await organization.save();

  writeOrganizationAudit({
    organizationId: organization._id.toString(),
    actorUserId: req.user!._id.toString(),
    actorRole: "taskmaster",
    action: "DOCUMENT_VERIFIED",
    severity: "info",
    targetType: "document",
    targetId: documentId.toString(),
    metadata: {
      message: `Document verified for ${organization.name} by ${req.user!.name}`,
      documentType: document.type,
    },
    req,
  });
};

// reject document (taskmaster)
export const rejectDocument = async (
  organizationId: ObjectId,
  documentId: ObjectId,
  reason: string,
  req: AuthenticatedRequest,
) => {
  const organization = await OrganizationRepository.findById(organizationId);
  if (!organization) {
    throw new ApiError(
      404,
      "Organization not found.",
      "ORGANIZATION_NOT_FOUND",
      "The organization you are trying to access does not exist.",
    );
  }

  const document = organization.documents.find((doc) => doc._id!.toString() === documentId.toString());
  if (!document) {
    throw new ApiError(
      404,
      "Document not found.",
      "DOCUMENT_NOT_FOUND",
      "The document you are trying to reject does not exist.",
    );
  }

  document.verified = false;
  document.rejected = true;
  document.rejectionReason = reason;
  document.checkedBy = req.user!._id.toString();

  await organization.save();

  writeOrganizationAudit({
    organizationId: organization._id.toString(),
    actorUserId: req.user!._id.toString(),
    actorRole: "taskmaster",
    action: "DOCUMENT_REJECTED",
    severity: "info",
    targetType: "document",
    targetId: documentId.toString(),
    metadata: {
      message: `Document rejected for ${organization.name} by ${req.user!.name}`,
      documentType: document.type,
      reason,
    },
    req,
  });
};
