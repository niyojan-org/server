import { AuthenticatedRequest } from "@core/middlewares/auth.middleware";
import { asyncHandler } from "@core/utils/asyncHandler";
import * as totpSetupService from "./totp.setup.service";
import { Request } from "express";
import { verifyTotp } from "./totp.service";
import { completeMfaLogin } from "../mfa/mfa.service";

export const startTotp = asyncHandler(async (req: AuthenticatedRequest, res) => {
  const data = await totpSetupService.startTotpSetup(req.user!);
  res.status(200).json({ success: true, message: "TOTP setup started successfully", data });
});

export const confirmTotp = asyncHandler(async (req: AuthenticatedRequest, res) => {
  const { token } = req.body;
  const { backupCodes } = await totpSetupService.confirmTotpSetup(req.user?._id.toString()!, token);
  res
    .status(200)
    .json({ success: true, message: "TOTP setup confirmed successfully", data: { backupCodes } });
});

export const totpLogin = asyncHandler(async (req: Request, res) => {
  const { userId, token } = req.body;
  await verifyTotp(userId, token);
  let data = await completeMfaLogin(userId, req);
  res.status(200).json({ success: true, message: "TOTP verified successfully", data });
});
