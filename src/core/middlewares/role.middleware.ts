import type { RequestHandler } from 'express';
import ApiError from '@core/errors/api.error';
import type { AuthenticatedRequest } from '@core/middlewares/auth.middleware';

export const requireRole = (...roles: string[]): RequestHandler => {
  return (req, _res, next) => {
    const authReq = req as AuthenticatedRequest;
    if (!authReq.user) {
      throw new ApiError(
        401,
        'Unauthorized: User not authenticated',
        'USER_NOT_AUTHENTICATED',
        'User must be authenticated to access this resource',
      );
    }

    if (!roles.includes(authReq.user.role)) {
      throw new ApiError(
        403,
        'Forbidden: Insufficient role',
        'INSUFFICIENT_ROLE',
        `User role '${authReq.user.role}' does not have access to this resource`,
      );
    }

    next();
  };
};
