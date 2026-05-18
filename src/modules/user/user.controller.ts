import type { RequestHandler, Response } from "express";
import ApiError from "@core/errors/api.error";
import { asyncHandler } from "@core/utils/asyncHandler";
import type { AuthenticatedRequest } from "@core/middlewares/auth.middleware";
import { deleteSelfUser } from "./user.delete.service";
import { updateSelfUser } from "./user.update.service";
import { clearRefreshToken } from "@modules/auth/helper/cookies.helper";
import { destroySession } from "@modules/auth/service";

export const getMe: RequestHandler = (req, res) => {
  const authReq = req as AuthenticatedRequest;
  if (!authReq.user) {
    throw new ApiError(401, "Unauthorized", "UNAUTHORIZED");
  }
  res.status(200).json({
    success: true,
    message: "User profile fetched successfully",
    data: authReq.user,
  });
};

export const updateMe = asyncHandler(async (req, res: Response) => {
  const authReq = req as AuthenticatedRequest;
  if (!authReq.user) {
    throw new ApiError(401, "Unauthorized", "UNAUTHORIZED");
  }

  const updatedUser = await updateSelfUser(authReq.user._id.toString(), req.body);

  res.status(200).json({
    success: true,
    message: "User profile updated successfully",
    data: updatedUser,
  });
});

export const deleteMe = asyncHandler(async (req, res: Response) => {
  const authReq = req as AuthenticatedRequest;
  if (!authReq.user) {
    throw new ApiError(401, "Unauthorized", "UNAUTHORIZED");
  }

  await deleteSelfUser(authReq.user._id.toString());
  clearRefreshToken(res);
  destroySession(authReq.user._id.toString());

  res.status(200).json({
    success: true,
    message: "User account deleted successfully",
  });
});
