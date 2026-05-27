import { Router } from 'express';
import { phonepeWebhook, razorpayWebhook } from '../controllers/webhook.controller';
import { WebhookRateLimit } from '@core/rate_limit/webhook-rate-limit';

const webhookRoutes = Router();

webhookRoutes.post('/razorpay', WebhookRateLimit.paymentWebhook(), razorpayWebhook);
webhookRoutes.post('/phonepe', WebhookRateLimit.paymentWebhook(), phonepeWebhook);

export default webhookRoutes;
