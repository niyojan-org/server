import { AuthenticatedRequest } from "@core/middlewares/auth.middleware";
import { asyncHandler } from "@core/utils/asyncHandler";
import { getMfaStatus } from "./mfa.service";

export const getMFAStatus = asyncHandler(async (req: AuthenticatedRequest, res) => {
  const status = await getMfaStatus(req.user!);
  res.status(200).json({ success: true, message: "MFA status retrieved successfully", status });
});
