import { asyncHandler } from '@core/utils/asyncHandler';
import z from 'zod';
import EventCouponsService from './event.coupons.services';
import { AddingCouponSchema, UpdatingCouponSchema } from './event.coupons.schema';
import { writeEventManagementAudit } from '../shared/event.management.audit';
import { findEventOrThrow } from '../shared/event.management.repository';
import { AuthenticatedRequest } from '@core/middlewares/auth.middleware';

const CouponParamsSchema = z.object({
  eventId: z.string().min(1, 'Invalid event ID'),
  couponId: z.string().min(1, 'Invalid coupon ID').optional(),
});

const writeAudit = async (
  req: AuthenticatedRequest,
  eventId: string,
  action: string,
  targetId?: string,
) => {
  const organizationId = (
    req.user.organization?.id ?? (await findEventOrThrow(eventId)).organizationId
  ).toString();
  writeEventManagementAudit({
    eventId,
    organizationId,
    actorUserId: req.user._id.toString(),
    actorRole: req.user.organization?.role ?? req.user.role,
    module: 'coupon',
    action,
    targetId,
    req,
  });
};

const getAllEventCoupons = asyncHandler(async (req, res) => {
  const { eventId } = CouponParamsSchema.parse(req.params);
  const data = await EventCouponsService.getAllEventCoupons(eventId);
  res.status(200).json({ message: 'Event coupons retrieved successfully', data });
});

const getSingleEventCoupon = asyncHandler(async (req, res) => {
  const { eventId, couponId } = CouponParamsSchema.parse(req.params);
  const data = await EventCouponsService.getSingleEventCoupon(eventId, couponId!);
  res.status(200).json({ message: 'Event coupon retrieved successfully', data });
});

const addEventCoupon = asyncHandler(async (req, res) => {
  const { eventId } = CouponParamsSchema.parse(req.params);
  const payload = AddingCouponSchema.parse(req.body);
  const data = await EventCouponsService.addEventCoupon(eventId, payload);
  await writeAudit(req, eventId, 'add');
  res.status(201).json({ message: 'Event coupon created successfully', data });
});

const updateEventCoupon = asyncHandler(async (req, res) => {
  const { eventId, couponId } = CouponParamsSchema.parse(req.params);
  const payload = UpdatingCouponSchema.parse(req.body);
  const data = await EventCouponsService.updateEventCoupon(eventId, couponId!, payload);
  await writeAudit(req, eventId, 'update', couponId);
  res.status(200).json({ message: 'Event coupon updated successfully', data });
});

const toggleEventCouponStatus = asyncHandler(async (req, res) => {
  const { eventId, couponId } = CouponParamsSchema.parse(req.params);
  const data = await EventCouponsService.toggleEventCouponStatus(eventId, couponId!);
  await writeAudit(req, eventId, 'toggle_status', couponId);
  res.status(200).json({ message: 'Event coupon status updated successfully', data });
});

const deleteEventCoupon = asyncHandler(async (req, res) => {
  const { eventId, couponId } = CouponParamsSchema.parse(req.params);
  await EventCouponsService.deleteEventCoupon(eventId, couponId!);
  await writeAudit(req, eventId, 'delete', couponId);
  res.status(200).json({ message: 'Event coupon deleted successfully' });
});

export {
  addEventCoupon,
  deleteEventCoupon,
  getAllEventCoupons,
  getSingleEventCoupon,
  toggleEventCouponStatus,
  updateEventCoupon,
};
