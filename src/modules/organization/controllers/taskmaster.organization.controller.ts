import { AuthenticatedRequest } from "@core/middlewares/auth.middleware";
import { asyncHandler } from "@core/utils/asyncHandler";
import {
  getPendingVerifications,
  rejectOrganizationVerification,
  verifyOrganization,
} from "../service/organization.verification.service";
import z, { success } from "zod";
import OrganizationQuery from "../service/organization.query.service";

const verifyOrganizationRequest = asyncHandler(async (req: AuthenticatedRequest, res) => {
  const { orgId } = z.object({ orgId: z.string() }).parse(req.params);
  await verifyOrganization(orgId, req);
  res.status(200).json({ message: "Organization verified successfully." });
});

const rejectOrganizationRequest = asyncHandler(async (req: AuthenticatedRequest, res) => {
  const { orgId } = z.object({ orgId: z.string() }).parse(req.params);
  const { reason } = z
    .object({ reason: z.string({ message: "Must provide a reason for rejection." }) })
    .parse(req.body);
  await rejectOrganizationVerification(orgId, req, reason);
  res.status(200).json({ message: "Organization verification rejected successfully." });
});

const getPendingVerificationsRequest = asyncHandler(async (req: AuthenticatedRequest, res) => {
  const { limit, page } = z
    .object({
      limit: z.coerce.number().int().positive().default(20),
      page: z.coerce.number().int().positive().default(1),
    })
    .parse(req.query);
  const pendingOrgs = await getPendingVerifications({ limit, page });
  res.status(200).json({ pendingVerifications: pendingOrgs });
});

const getOrganizationsSummary = asyncHandler(async (req: AuthenticatedRequest, res) => {
  const summary = await OrganizationQuery.getSummary();
  res.status(200).json({ success: true, message: "Summary fetched successfully.", summary });
});

export {
  verifyOrganizationRequest,
  rejectOrganizationRequest,
  getPendingVerificationsRequest,
  getOrganizationsSummary,
};
