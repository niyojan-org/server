import { AuthenticatedRequest } from "@core/middlewares/auth.middleware";
import { asyncHandler } from "@core/utils/asyncHandler";
import * as PasskeyManagement from "./services/passkey.management.service";
import * as PasskeyRegistrationService from "./services/passkey.registration.service";
import {
  startPasskeyAuthentication,
  verifyPasskeyAuthentication,
} from "./services/passkey.service";
import { completeMfaLogin } from "../mfa/mfa.service";

export const getListOfPasskeys = asyncHandler(async (req: AuthenticatedRequest, res) => {
  const userId = req.user!._id.toString();
  const passkeys = await PasskeyManagement.getPasskeys(userId);
  res.status(200).json({ success: true, message: "Passkeys retrieved successfully", passkeys });
});

export const startPasskeyRegistration = asyncHandler(async (req: AuthenticatedRequest, res) => {
  const { name } = req.body || {};
  const options = await PasskeyRegistrationService.getRegistrationChallenge(req.user!, name);
  res
    .status(200)
    .json({ success: true, message: "Passkey registration challenge generated", options });
});

export const finishPasskeyRegistration = asyncHandler(async (req: AuthenticatedRequest, res) => {
  const { credential } = req.body;
  const { backupCodes } = await PasskeyRegistrationService.finishPasskeyRegistration(
    req.user!._id.toString(),
    credential
  );
  res.status(200).json({ success: true, message: "Passkey registered successfully", backupCodes });
});

export const editPasskey = asyncHandler(async (req: AuthenticatedRequest, res) => {
  const userId = req.user!._id.toString();
  const { passkeyId } = req.params;
  const { name } = req.body;
  const passkey = await PasskeyManagement.editPasskey(userId, passkeyId!, name);
  res.status(200).json({ success: true, message: "Passkey updated successfully", passkey });
});
export const deletePasskey = asyncHandler(async (req: AuthenticatedRequest, res) => {
  const userId = req.user!._id.toString();
  const { passkeyId } = req.params;
  await PasskeyManagement.deletePasskey(userId, passkeyId!);
  res.status(200).json({ success: true, message: "Passkey deleted successfully" });
});

export const startPasskeyAuthenticationOption = asyncHandler(async (req, res) => {
  const { userId } = req.body;
  const options = await startPasskeyAuthentication(userId);
  res
    .status(200)
    .json({ success: true, message: "Passkey authentication options generated", options });
});

export const finishPasskeyAuthentication = asyncHandler(async (req, res) => {
  const { userId, assertion } = req.body;
  await verifyPasskeyAuthentication(userId, assertion);
  const data = await completeMfaLogin(userId, req);
  res.status(200).json({ success: true, message: "Passkey authentication successful", data });
});
