import type { RateLimitRequestHandler } from 'express-rate-limit';
import { BaseRateLimit } from './base-rate-limit';

export class UploadRateLimit extends BaseRateLimit {
  public static limiter(): RateLimitRequestHandler {
    return this.createLimiter({
      windowMs: 60 * 1000,
      max: 20,
      message: 'Too many upload requests.',
      prefix: 'upload',
    });
  }
}
