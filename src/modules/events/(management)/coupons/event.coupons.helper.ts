import ApiError from '@core/errors/api.error';
import { Coupon, EventDocument } from '@modules/events/core/event.types';

const validateCoupon = (event: EventDocument, coupon: Coupon, isNew: boolean) => {
  if (!event.allowCoupons) {
    throw new ApiError(
      400,
      'Coupons are disabled for this event',
      'COUPONS_DISABLED',
      'Enable allowCoupons before creating or updating event coupons.',
    );
  }
  if (isNew && event.coupons.length >= 100) {
    throw new ApiError(
      400,
      'Cannot add more than 100 coupons to an event',
      'COUPON_LIMIT_EXCEEDED',
      'Remove an existing coupon before adding a new one.',
    );
  }
  const duplicateCode = event.coupons.find(
    (existing) =>
      existing.code.toUpperCase() === coupon.code.toUpperCase() &&
      existing._id?.toString() !== coupon._id?.toString(),
  );
  if (duplicateCode) {
    throw new ApiError(
      400,
      `Coupon code ${coupon.code} already exists`,
      'DUPLICATE_COUPON_CODE',
      'Each coupon code must be unique within an event.',
    );
  }

  if (coupon.validTicketTypes?.length) {
    const ticketIds = new Set(event.tickets.map((ticket) => ticket._id?.toString()));
    const hasUnknownTicket = coupon.validTicketTypes.some(
      (ticketId) => !ticketIds.has(ticketId.toString()),
    );
    if (hasUnknownTicket) {
      throw new ApiError(
        400,
        'Coupon references unknown tickets',
        'INVALID_COUPON_TICKETS',
        'Only existing event ticket ids can be used in validTicketTypes.',
      );
    }
  }
};

const ensureCouponIsUsable = (coupon: Coupon) => {
  const now = new Date();
  const effectiveEnd = coupon.expiresAt ?? coupon.endsAt;
  if (!coupon.isActive) {
    throw new ApiError(400, 'Coupon is inactive', 'COUPON_INACTIVE', 'Use an active coupon code.');
  }
  if (coupon.startsAt && coupon.startsAt > now) {
    throw new ApiError(400, 'Coupon is not active yet', 'COUPON_NOT_STARTED', 'Use the coupon after its start time.');
  }
  if (effectiveEnd && effectiveEnd < now) {
    throw new ApiError(400, 'Coupon has expired', 'COUPON_EXPIRED', 'Use a valid coupon inside its active window.');
  }
  if (coupon.maxUsage && coupon.usedCount >= coupon.maxUsage) {
    throw new ApiError(400, 'Coupon usage limit reached', 'COUPON_USAGE_EXHAUSTED', 'This coupon can no longer be used.');
  }
};

export default {
  ensureCouponIsUsable,
  validateCoupon,
};
