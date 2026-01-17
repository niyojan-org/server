import { asyncHandler } from "@core/utils/asyncHandler";
import * as authService from "./service";
import { getRefreshToken } from "./helper/cookies.helper";
import { AuthenticatedRequest } from "@core/middlewares/auth.middleware";
import type { Request } from "express";
import { extractIntent, resolveRedirect } from "./utils/redirect";
import env from "@config/env";

export const login = asyncHandler(async (req, res) => {
  const result = await authService.login(req.body, req);
  res.status(200).json({
    success: true,
    message: "Login successful",
    data: result,
  });
});

export const register = asyncHandler(async (req, res) => {
  const result = await authService.register(req.body);
  res.status(201).json({
    success: true,
    message: "Registration successful",
    data: result,
  });
});

export const verifyEmail = asyncHandler(async (req, res) => {
  await authService.verifyEmail(req.body.email as string, req.body.token as string);
  res.status(200).json({
    success: true,
    message: "Email verified successfully",
  });
});

export const refreshAccessToken = asyncHandler(async (req, res) => {
  const refreshToken = getRefreshToken(req);
  const token = await authService.refreshAccessToken(refreshToken!);
  res.status(200).json({
    success: true,
    message: "Access token refreshed successfully",
    token,
    data: { token },
  });
});

export const logout = asyncHandler(async (req: AuthenticatedRequest, res) => {
  await authService.logout(req.user?._id.toString()!, res);
  res.status(200).json({
    success: true,
    message: "Logout successful",
  });
});

export const forgotPassword = asyncHandler(async (req, res) => {
  await authService.forgetPassword(req.body.email);
  res.status(200).json({
    success: true,
    message: "Password reset token sent to email",
  });
});

export const resetPassword = asyncHandler(async (req: Request, res) => {
  await authService.resetPasswordWithToken(
    req.body.email,
    req.body.newPassword,
    req.body.token,
    req
  );
  res.status(200).json({
    success: true,
    message: "Password reset successful",
  });
});

export const changePassword = asyncHandler(async (req: AuthenticatedRequest, res) => {
  await authService.changePassword(
    req.user?._id.toString()!,
    req.body.oldPassword,
    req.body.newPassword,
    req
  );
  res.status(200).json({
    success: true,
    message: "Password changed successfully",
  });
});

export const googleRedirect = asyncHandler(async (req: Request, res) => {
  const redirectUrl = authService.redirectToGoogleOAuth(req);
  res.redirect(redirectUrl);
});

export const googleCallback = asyncHandler(async (req, res) => {
  const { code, state } = req.query;
  const user = await authService.authenticateWithGoogle(code as string);
  const result = await authService.completeOAuthLogin(user, req);
  const intent = extractIntent(state as string | undefined);
  const finalRedirect = resolveRedirect(intent ?? undefined) ?? env.AUTH_URL;
  return res.redirect(finalRedirect);
});
