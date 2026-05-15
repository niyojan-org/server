import { asyncHandler } from '@core/utils/asyncHandler';
import { objectIdSchema } from '@helpers/zod';
import { z } from 'zod';
import PaymentFeeConfigService from '../services/payment-fee-config.service';
import { PaymentGateway } from '../types/payment.enums';

const feeConfigSchema = z.object({
  organizationId: objectIdSchema,
  gateway: z.nativeEnum(PaymentGateway),
  platformFeePercent: z.number().min(0).optional(),
  platformFeeFlat: z.number().min(0).optional(),
  gatewayFeePercent: z.number().min(0).optional(),
  gatewayFeeFlat: z.number().min(0).optional(),
  taxPercent: z.number().min(0).optional(),
  taxFlat: z.number().min(0).optional(),
  createdBy: objectIdSchema.optional(),
});

export const upsertFeeConfig = asyncHandler(async (req, res) => {
  const payload = feeConfigSchema.parse(req.body);
  const config = await PaymentFeeConfigService.upsertConfig(payload);
  res.status(201).json({
    success: true,
    message: 'Fee config saved',
    data: config,
  });
});

export const listFeeConfigs = asyncHandler(async (req, res) => {
  const { organizationId } = z
    .object({ organizationId: objectIdSchema })
    .parse(req.params);

  const configs = await PaymentFeeConfigService.listConfigs(organizationId);
  res.status(200).json({
    success: true,
    message: 'Fee configs fetched',
    data: configs,
  });
});
