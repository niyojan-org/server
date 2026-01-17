import { Response } from "express";
import { AuthenticatedRequest } from "@core/middlewares/auth.middleware";

export const getMe = (req: AuthenticatedRequest, res: Response) => {
  res.status(200).json({
    success: true,
    message: "User profile fetched successfully",
    data: req.user,
  });
};
