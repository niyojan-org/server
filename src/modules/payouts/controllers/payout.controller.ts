import { asyncHandler } from '@core/utils/asyncHandler';
import { objectIdSchema } from '@helpers/zod';
import { z } from 'zod';
import PayoutService from '../services/payout.service';
import { PaymentGateway } from '@modules/payments/types/payment.enums';

const createPayoutSchema = z.object({
  organizationId: objectIdSchema,
  amount: z.number().int().positive(),
  currency: z.string().optional(),
  method: z.string().optional(),
  gateway: z.nativeEnum(PaymentGateway).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
  createdBy: objectIdSchema.optional(),
});

const statusSchema = z.object({
  reason: z.string().optional(),
});

export const createPayout = asyncHandler(async (req, res) => {
  const payload = createPayoutSchema.parse(req.body);
  const payout = await PayoutService.initiatePayout({
    organizationId: payload.organizationId,
    amount: payload.amount,
    currency: payload.currency,
    method: payload.method,
    gateway: payload.gateway,
    metadata: payload.metadata,
    createdBy: payload.createdBy,
  });

  res.status(201).json({
    success: true,
    message: 'Payout created and locked',
    data: payout,
  });
});

export const markPayoutSuccess = asyncHandler(async (req, res) => {
  const { payoutId } = z
    .object({ payoutId: objectIdSchema })
    .parse(req.params);

  const payout = await PayoutService.markSuccess(payoutId);

  res.status(200).json({
    success: true,
    message: 'Payout marked as success',
    data: payout,
  });
});

export const markPayoutFailed = asyncHandler(async (req, res) => {
  const { payoutId } = z
    .object({ payoutId: objectIdSchema })
    .parse(req.params);
  const payload = statusSchema.parse(req.body);

  const payout = await PayoutService.markFailed(payoutId, payload.reason);

  res.status(200).json({
    success: true,
    message: 'Payout marked as failed',
    data: payout,
  });
});
