import { asyncHandler } from '@core/utils/asyncHandler';
import WebhookService from '../services/webhook.service';
import { PaymentGateway } from '../types/payment.enums';

export const razorpayWebhook = asyncHandler(async (req, res) => {
  const signature = req.headers['x-razorpay-signature'] as string | undefined;
  const rawBody =
    (req as { rawBody?: string }).rawBody ?? JSON.stringify(req.body ?? {});

  await WebhookService.handleGatewayWebhook({
    gateway: PaymentGateway.RAZORPAY,
    rawBody,
    signature,
    payload: req.body,
    headers: req.headers as Record<string, unknown>,
  });

  res.status(200).json({
    success: true,
    message: 'Webhook processed',
  });
});

export const phonepeWebhook = asyncHandler(async (req, res) => {
  const signature = req.headers['x-verify'] as string | undefined;
  const rawBody =
    (req as { rawBody?: string }).rawBody ?? JSON.stringify(req.body ?? {});

  await WebhookService.handleGatewayWebhook({
    gateway: PaymentGateway.PHONEPE,
    rawBody,
    signature,
    payload: req.body,
    headers: req.headers as Record<string, unknown>,
  });

  res.status(200).json({
    success: true,
    message: 'Webhook processed',
  });
});
