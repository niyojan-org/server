import ApiError from '@core/errors/api.error';
import { Organization } from '@modules/organization/types/organization.schema';

const checkEventCreationStatus = (org: Organization) => {
  if (!org.active) {
    throw new ApiError(
      403,
      'Organization is inactive and cannot create events.',
      'ORGANIZATION_INACTIVE',
      'The organization is currently marked as inactive. Please contact support for more information.',
    );
  }

  if (org.isBlocked) {
    throw new ApiError(
      403,
      'Organization is blocked and cannot create events.',
      'ORGANIZATION_BLOCKED',
      'The organization has been blocked due to policy violations. Please contact support for more information.',
    );
  }

  if (!org.verified) {
    throw new ApiError(
      403,
      'Organization is not verified and cannot create events.',
      'ORGANIZATION_UNVERIFIED',
      'The organization has not completed the verification process. Please complete verification to enable event creation.',
    );
  }

  if (!org.allowsEventCreation) {
    throw new ApiError(
      403,
      'Event creation is disabled for this organization.',
      'EVENT_CREATION_DISABLED',
      'Event creation is currently disabled for this organization.',
    );
  }

  return { allowed: true };
};

export { checkEventCreationStatus };
