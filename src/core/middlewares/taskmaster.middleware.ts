import type { Response, NextFunction } from "express";
import type { AuthenticatedRequest } from "./auth.middleware";
import ApiError from "@core/errors/api.error";

export const isTaskMaster = () => {
  return async (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new ApiError(
        401,
        "Unauthorized: No user logged in",
        "UNAUTHORIZED",
        "User must be logged in to access this resource",
      );
    }
    if (req.user.role !== "taskmaster") {
      throw new ApiError(
        403,
        "Forbidden: Insufficient role",
        "INSUFFICIENT_ROLE",
        "User must have taskmaster role to access this resource",
      );
    }
    next();
  };
};
