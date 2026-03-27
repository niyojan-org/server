import { Response } from "express";
import ApiError from "@core/errors/api.error";
import { AuthenticatedRequest } from "@core/middlewares/auth.middleware";
import { asyncHandler } from "@core/utils/asyncHandler";
import { deleteSelfUser } from "./user.delete.service";
import { updateSelfUser } from "./user.update.service";
import { clearRefreshToken } from "@modules/auth/helper/cookies.helper";
import { destroySession } from "@modules/auth/service";

export const getMe = (req: AuthenticatedRequest, res: Response) => {
  res.status(200).json({
    success: true,
    message: "User profile fetched successfully",
    data: req.user,
  });
};

export const updateMe = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    throw new ApiError(401, "Unauthorized", "UNAUTHORIZED");
  }

  const updatedUser = await updateSelfUser(req.user._id.toString(), req.body);

  res.status(200).json({
    success: true,
    message: "User profile updated successfully",
    data: updatedUser,
  });
});

export const deleteMe = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    throw new ApiError(401, "Unauthorized", "UNAUTHORIZED");
  }

  await deleteSelfUser(req.user._id.toString());
  clearRefreshToken(res);
  destroySession(req.user._id.toString());

  res.status(200).json({
    success: true,
    message: "User account deleted successfully",
  });
});
