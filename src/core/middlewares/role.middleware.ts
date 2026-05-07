import type { RequestHandler } from "express";
import ApiError from "@core/errors/api.error";

export const requireRole = (...roles: string[]): RequestHandler => {
  return (req, _res, next) => {
    if (!req.user) {
      throw new ApiError(
        401,
        "Unauthorized: User not authenticated",
        "USER_NOT_AUTHENTICATED",
        "User must be authenticated to access this resource"
      );
    }

    if (!roles.includes(req.user.role)) {
      throw new ApiError(
        403,
        "Forbidden: Insufficient role",
        "INSUFFICIENT_ROLE",
        `User role '${req.user.role}' does not have access to this resource`
      );
    }

    next();
  };
};
