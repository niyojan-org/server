import { AuthenticatedRequest } from "@core/middlewares/auth.middleware";
import { asyncHandler } from "@core/utils/asyncHandler";
import { OrganizationRequest } from "@core/middlewares/organization.middleware";
import getOrganizationView from "../views/organization.view";
import { raiseOrgVerification } from "../service/organization.verification.service";
import createAnOrganization from "../service/admin/organization.create.service";
import updateAnOrganization from "../service/admin/organization.update.service";
export * from "./bank.controller";

export const getOrganizationAdmin = asyncHandler(async (req: OrganizationRequest, res) => {
  const organization = getOrganizationView(req.organization, req.user!.organization!.role);
  res
    .status(200)
    .json({ success: true, message: "Organization retrieved successfully", organization });
});

export const createOrganization = asyncHandler(async (req: AuthenticatedRequest, res) => {
  const organization = await createAnOrganization(req);
  res
    .status(201)
    .json({ success: true, message: "Organization created successfully", organization });
});

export const raiseOrganizationVerification = asyncHandler(async (req: OrganizationRequest, res) => {
  await raiseOrgVerification(req);
  res
    .status(200)
    .json({ success: true, message: "Organization verification request raised successfully" });
});

export const updateOrganization = asyncHandler(async (req: OrganizationRequest, res) => {
  const organization = await updateAnOrganization(req);
  res
    .status(200)
    .json({ success: true, message: "Organization updated successfully", organization });
});
