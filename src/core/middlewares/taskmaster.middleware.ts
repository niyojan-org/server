import type { RequestHandler } from "express";
import ApiError from "@core/errors/api.error";
import type { AuthenticatedRequest } from "@core/middlewares/auth.middleware";

export const isTaskMaster = (): RequestHandler => {
  return async (req, _res, next) => {
    const authReq = req as AuthenticatedRequest;
    if (!authReq.user) {
      throw new ApiError(
        401,
        "Unauthorized: No user logged in",
        "UNAUTHORIZED",
        "User must be logged in to access this resource",
      );
    }
    if (authReq.user.role !== "taskmaster") {
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
