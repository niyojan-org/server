import { asyncHandler } from '@core/utils/asyncHandler';
import z from 'zod';
import EventCouponsService from './event.coupons.services';
import { CouponValidationSchema } from './event.coupons.schema';

const CouponParamsSchema = z.object({
  eventId: z.string().min(1, 'Invalid event ID'),
});

const validateCoupon = asyncHandler(async (req, res) => {
  const { eventId } = CouponParamsSchema.parse(req.params);
  const { code, ticketId, orderAmountPaisa } = CouponValidationSchema.parse(req.body);
  const data = await EventCouponsService.validateCoupon(
    eventId,
    code,
    ticketId,
    orderAmountPaisa,
  );
  res.status(200).json({ message: 'Coupon validated successfully', data });
});

export { validateCoupon };
