import ApiError from "@core/errors/api.error";
import { OrganizationRequest } from "@core/middlewares/organization.middleware";
import { sendOrganizationEmail } from "@infra/mail";
import writeOrganizationAudit from "../../../../audits/organization.audit";
import { checkOrgDataValidity } from "./validators";

// raise org verification request
export const raiseOrgVerification = async (req: OrganizationRequest) => {
  if (req.organization?.reqForVerification) {
    throw new ApiError(
      400,
      "Verification request already raised.",
      "VERIFICATION_REQUEST_EXISTS",
      "A verification request for this organization is already pending, please wait for review.",
    );
  }

  if (req.organization?.verified) {
    throw new ApiError(
      400,
      "Organization already verified.",
      "ALREADY_VERIFIED",
      "This organization is already verified.",
    );
  }

  // check data validity
  const dataCheck = checkOrgDataValidity(req.organization);
  if (!dataCheck.valid) {
    throw new ApiError(
      400,
      "Incomplete organization data.",
      "INCOMPLETE_DATA",
      `Missing required fields: ${dataCheck.missing.join(", ")}`,
    );
  }

  req.organization!.reqForVerification = true;
  await req.organization!.save();

  await sendOrganizationEmail.organizationVerificationRequested(req.user!.email, {
    ownerName: req.user!.name,
    organizationName: req.organization.name,
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
