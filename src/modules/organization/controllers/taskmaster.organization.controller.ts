import { AuthenticatedRequest } from "@core/middlewares/auth.middleware";
import { asyncHandler } from "@core/utils/asyncHandler";
import OrganizationQuery from "../service/organization.query.service";

const getOrganizationsSummary = asyncHandler(async (req: AuthenticatedRequest, res) => {
  const summary = await OrganizationQuery.getSummary();
  res.status(200).json({ success: true, message: "Summary fetched successfully.", summary });
});

const getOrganizationById = asyncHandler(async (req: AuthenticatedRequest, res) => {
  const organization = await OrganizationQuery.getOrganizationById(req);
  res
    .status(200)
    .json({ success: true, message: "Organization fetched successfully.", data: organization });
});

export { getOrganizationsSummary, getOrganizationById };
