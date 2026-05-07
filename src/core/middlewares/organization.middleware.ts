import type { RequestHandler } from 'express';
import type { AuthenticatedRequest } from './auth.middleware';
import ApiError from '@core/errors/api.error';
import { ORGANIZATION_ROLES } from '@modules/user/user.constants';
import { OrganizationRepository } from '@modules/organization/persistence/organization.repository';
import { OrganizationDocument } from '@modules/organization/persistence/organization.model';

type OrganizationRole = (typeof ORGANIZATION_ROLES)[number];

export interface OrganizationRequest extends AuthenticatedRequest {
  organization: OrganizationDocument;
}

export const organizationRole = (...roles: OrganizationRole[]): RequestHandler => {
  return async (req, _res, next) => {
    const authReq = req as AuthenticatedRequest;
    if (!authReq.user) {
      return next(
        new ApiError(
          401,
          'Unauthorized: User not authenticated',
          'USER_NOT_AUTHENTICATED',
          'User must be authenticated to access this resource',
        ),
      );
    }

    if (!authReq.user.organization?.id) {
      return next(
        new ApiError(
          403,
          'Forbidden: No organization associated',
          'NO_ORGANIZATION',
          'User must be associated with an organization to access this resource',
        ),
      );
    }

    if (!roles.includes(authReq.user.organization.role as OrganizationRole)) {
      return next(
        new ApiError(
          403,
          'Forbidden: Insufficient organization role',
          'INSUFFICIENT_ORGANIZATION_ROLE',
          `User organization role '${authReq.user.organization.role}' does not have access to this resource`,
        ),
      );
    }
    const organization = await OrganizationRepository.findById(
      authReq.user.organization.id,
    );
    if (!organization) {
      return next(
        new ApiError(
          404,
          'Organization not found',
          'ORGANIZATION_NOT_FOUND',
          'The organization associated with the user does not exist',
        ),
      );
    }
    (req as OrganizationRequest).organization = organization;
    next();
  };
};
