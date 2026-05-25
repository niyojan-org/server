import ApiError from '@core/errors/api.error';
import cookiesHelper from '@modules/auth/helper/cookies.helper';
import { validateSession, verifyAccessToken } from '@modules/auth/service';
import UserModel from '@modules/user/user.model';
import { UserDocument } from '@modules/user/user.types';
import type { Request, RequestHandler } from 'express';

export interface AuthenticatedRequest extends Request {
  user: UserDocument;
}

export const authenticate: RequestHandler = async (req, _res, next) => {
  const authReq = req as AuthenticatedRequest;
  try {
    const authHeader = authReq.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) {
      const cookieToken = cookiesHelper.getAccessToken(req);
      if (cookieToken) {
        authReq.headers.authorization = `Bearer ${cookieToken}`;
        return authenticate(authReq, _res, next);
      }
      throw new ApiError(
        401,
        'Authentication token missing',
        'TOKEN_MISSING',
        'Authentication token is required but missing from the request headers',
      );
    }
    const payload = await verifyAccessToken(token);
    await validateSession(payload.userId, payload.sessionId);
    const user = await UserModel.findById(payload.userId);
    if (!user) {
      throw new ApiError(
        404,
        'User not found',
        'USER_NOT_FOUND',
        'The user associated with the provided token does not exist',
      );
    }
    authReq.user = user;
    next();
  } catch (error) {
    next(error);
  }
};
