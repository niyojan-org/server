import ApiError from '@core/errors/api.error';
import { Coupon, Ticket } from '@modules/events/core/event.types';
import {
  findEventOrThrow,
  resolveCollectionItemIndex,
  throwItemNotFound,
  updateEventCollection,
} from '../shared/event.management.repository';
import EventCouponsHelper from './event.coupons.helper';
import { AddingCouponInput } from './event.coupons.schema';

const findCouponOrThrow = (eventId: string, coupons: Coupon[], couponId: string) => {
  const index = resolveCollectionItemIndex(coupons, couponId, 'code');
  if (index === -1 || !coupons[index]) throwItemNotFound('coupon', couponId, eventId);
  return { index, coupon: coupons[index] as Coupon };
};

const findTicketById = (tickets: Ticket[], ticketId?: string) =>
  ticketId ? tickets.find((ticket) => ticket._id?.toString() === ticketId) : undefined;

export default class EventCouponsService {
  static async getAllEventCoupons(eventId: string) {
    const event = await findEventOrThrow(eventId);
    return event.coupons;
  }

  static async getSingleEventCoupon(eventId: string, couponId: string) {
    const event = await findEventOrThrow(eventId);
    return findCouponOrThrow(eventId, event.coupons, couponId).coupon;
  }

  static async addEventCoupon(eventId: string, payload: AddingCouponInput) {
    const event = await findEventOrThrow(eventId);
    const nextCoupon = { ...payload, usedCount: 0 } as Coupon;
    EventCouponsHelper.validateCoupon(event, nextCoupon, true);
    const updatedEvent = await updateEventCollection(eventId, 'coupons', [
      ...event.coupons,
      nextCoupon,
    ]);
    return updatedEvent?.coupons ?? [];
  }

  static async updateEventCoupon(eventId: string, couponId: string, payload: Partial<Coupon>) {
    const event = await findEventOrThrow(eventId);
    const { index, coupon } = findCouponOrThrow(eventId, event.coupons, couponId);
    const updatedCoupon = { ...coupon, ...payload } as Coupon;
    EventCouponsHelper.validateCoupon(event, updatedCoupon, false);
    const coupons = [...event.coupons];
    coupons[index] = updatedCoupon;
    const updatedEvent = await updateEventCollection(eventId, 'coupons', coupons);
    return updatedEvent?.coupons[index];
  }

  static async toggleEventCouponStatus(eventId: string, couponId: string) {
    const event = await findEventOrThrow(eventId);
    const { index, coupon } = findCouponOrThrow(eventId, event.coupons, couponId);
    const coupons = [...event.coupons];
    coupons[index] = { ...coupon, isActive: !coupon.isActive };
    await updateEventCollection(eventId, 'coupons', coupons);
    return coupons[index];
  }

  static async deleteEventCoupon(eventId: string, couponId: string) {
    const event = await findEventOrThrow(eventId);
    const { coupon } = findCouponOrThrow(eventId, event.coupons, couponId);
    if (coupon.usedCount > 0) {
      throw new ApiError(
        400,
        'Cannot delete a coupon that has already been used',
        'COUPON_DELETE_FAILED',
        `This coupon has already been used ${coupon.usedCount} times.`,
      );
    }
    await updateEventCollection(
      eventId,
      'coupons',
      event.coupons.filter((item) => item._id?.toString() !== coupon._id?.toString()),
    );
  }

  static async validateCoupon(eventId: string, code: string, ticketId?: string, orderAmountPaisa?: number) {
    const event = await findEventOrThrow(eventId);
    const { coupon } = findCouponOrThrow(eventId, event.coupons, code);
    EventCouponsHelper.ensureCouponIsUsable(coupon);
    const ticket = findTicketById(event.tickets, ticketId);
    if (ticketId && !ticket) throwItemNotFound('ticket', ticketId, eventId);
    if (
      coupon.validTicketTypes?.length &&
      ticket &&
      !coupon.validTicketTypes.some((item) => item.toString() === ticket._id?.toString())
    ) {
      throw new ApiError(
        400,
        'Coupon is not valid for this ticket',
        'COUPON_TICKET_MISMATCH',
        'Use this coupon only with the supported ticket types.',
      );
    }
    const baseAmount = orderAmountPaisa ?? ticket?.price ?? 0;
    const discountAmountPaisa =
      coupon.discountType === 'percentage'
        ? Math.floor((baseAmount * coupon.discountValue) / 100)
        : Math.min(baseAmount, coupon.discountValue);

    return {
      coupon,
      ticketId: ticket?._id?.toString(),
      orderAmountPaisa: baseAmount,
      discountAmountPaisa,
      finalAmountPaisa: Math.max(0, baseAmount - discountAmountPaisa),
    };
  }
}
