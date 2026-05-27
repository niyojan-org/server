import type { RateLimitRequestHandler } from 'express-rate-limit';
import { BaseRateLimit } from './base-rate-limit';

export class WebhookRateLimit extends BaseRateLimit {
  public static paymentWebhook(): RateLimitRequestHandler {
    return this.createLimiter({
      windowMs: 60 * 1000, // 1 minute
      max: 100,
      message: 'Too many webhook requests. Please try again later.',
      prefix: 'webhook-payment',
    });
  }
}
