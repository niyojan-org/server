import ApiError from "@core/errors/api.error";
import { validateSession, verifyAccessToken } from "@modules/auth/service";
import UserModel from "@modules/user/user.model";
import { UserDocument } from "@modules/user/user.types";
import type { Request, Response, NextFunction } from "express";

export interface AuthenticatedRequest extends Request {
  user?: UserDocument;
}

export const authenticate = async (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
    if (!token) {
      throw new ApiError(
        401,
        "Authentication token missing",
        "TOKEN_MISSING",
        "Authentication token is required but missing from the request headers"
      );
    }
    const payload = await verifyAccessToken(token);
    await validateSession(payload.userId, payload.sessionId);
    const user = await UserModel.findById(payload.userId);
    if (!user) {
      throw new ApiError(
        404,
        "User not found",
        "USER_NOT_FOUND",
        "The user associated with the provided token does not exist"
      );
    }
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};
