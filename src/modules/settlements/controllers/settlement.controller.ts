import { asyncHandler } from '@core/utils/asyncHandler';
import { objectIdSchema } from '@helpers/zod';
import { z } from 'zod';
import SettlementService from '../services/settlement.service';

const releaseSchema = z.object({
  organizationId: objectIdSchema,
  eventId: objectIdSchema,
  amount: z.number().int().positive(),
  currency: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
  createdBy: objectIdSchema.optional(),
});

export const releaseSettlement = asyncHandler(async (req, res) => {
  const payload = releaseSchema.parse(req.body);
  const settlement = await SettlementService.releaseHoldToAvailable({
    organizationId: payload.organizationId,
    eventId: payload.eventId,
    amount: payload.amount,
    currency: payload.currency,
    metadata: payload.metadata,
    createdBy: payload.createdBy,
  });

  res.status(200).json({
    success: true,
    message: 'Settlement released',
    data: settlement,
  });
});
