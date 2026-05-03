import { CouponBaseSchema } from '@modules/events/core/event.zod';
import z from 'zod';

const CouponWriteObjectSchema = CouponBaseSchema.omit({ usedCount: true });

const CouponWriteSchema = CouponWriteObjectSchema.refine(
  (coupon) =>
    coupon.discountType === 'percentage'
      ? coupon.discountValue <= 100
      : Number.isInteger(coupon.discountValue),
  {
    message:
      'Percentage discount must be 100 or less and fixed discount must be a whole paisa amount',
    path: ['discountValue'],
  },
).refine(
  (coupon) => (coupon.startsAt && coupon.endsAt ? coupon.endsAt > coupon.startsAt : true),
  {
    message: 'Coupon end date must be after start date',
    path: ['endsAt'],
  },
);

export const AddingCouponSchema = CouponWriteSchema;
export const UpdatingCouponSchema = CouponWriteObjectSchema.partial().superRefine(
  (coupon, ctx) => {
    if (
      coupon.discountType === 'percentage' &&
      coupon.discountValue !== undefined &&
      coupon.discountValue > 100
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Percentage discount must be 100 or less',
        path: ['discountValue'],
      });
    }
    if (
      coupon.discountType === 'fixed' &&
      coupon.discountValue !== undefined &&
      !Number.isInteger(coupon.discountValue)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Fixed discount must be a whole paisa amount',
        path: ['discountValue'],
      });
    }
    if (
      coupon.startsAt &&
      coupon.endsAt &&
      coupon.endsAt <= coupon.startsAt
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Coupon end date must be after start date',
        path: ['endsAt'],
      });
    }
  },
);

export const CouponValidationSchema = z.object({
  code: z.string().min(1, 'Coupon code is required').transform((value) => value.trim().toUpperCase()),
  ticketId: z.string().min(1, 'Ticket id must not be empty').optional(),
  orderAmountPaisa: z
    .number()
    .int({ message: 'Order amount must be in paisa as a whole number' })
    .min(0, { message: 'Order amount cannot be negative' })
    .optional(),
});

export type AddingCouponInput = z.infer<typeof AddingCouponSchema>;
