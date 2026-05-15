import { asyncHandler } from '@core/utils/asyncHandler';
import { objectIdSchema } from '@helpers/zod';
import { z } from 'zod';
import PaymentService from '../services/payment.service';
import PaymentOrchestratorService from '../services/payment-orchestrator.service';
import { PaymentGateway } from '../types/payment.enums';
import { LedgerBalanceType } from '@modules/wallet/types/ledger.enums';

const createPaymentOrderSchema = z.object({
  registrationId: objectIdSchema,
  organizationId: objectIdSchema,
  eventId: objectIdSchema,
  amount: z.number().int().positive(),
  currency: z.string().optional(),
  gateway: z.nativeEnum(PaymentGateway),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

const refundSchema = z.object({
  amount: z.number().int().positive().optional(),
  balanceType: z.nativeEnum(LedgerBalanceType).optional(),
  reason: z.string().optional(),
});

export const createPaymentOrder = asyncHandler(async (req, res) => {
  const payload = createPaymentOrderSchema.parse(req.body);
  const result = await PaymentService.createPaymentOrder(payload);
  res.status(201).json({
    success: true,
    message: 'Payment order created',
    data: result,
  });
});

export const getPayment = asyncHandler(async (req, res) => {
  const { paymentId } = z
    .object({
      paymentId: objectIdSchema,
    })
    .parse(req.params);

  const payment = await PaymentService.getPaymentById(paymentId);
  res.status(200).json({
    success: true,
    message: 'Payment fetched',
    data: payment,
  });
});

export const refundPayment = asyncHandler(async (req, res) => {
  const { paymentId } = z
    .object({
      paymentId: objectIdSchema,
    })
    .parse(req.params);

  const payload = refundSchema.parse(req.body);

  const result = await PaymentOrchestratorService.processRefund({
    paymentId,
    amount: payload.amount,
    balanceType: payload.balanceType,
    reason: payload.reason,
  });

  res.status(200).json({
    success: true,
    message: 'Refund processed',
    data: result,
  });
});
