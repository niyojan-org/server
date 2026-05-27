import type { RateLimitRequestHandler } from 'express-rate-limit';
import { BaseRateLimit } from './base-rate-limit';

class GlobalRateLimit extends BaseRateLimit {
  public static limiter(): RateLimitRequestHandler {
    return this.createLimiter({
      windowMs: 15 * 60 * 1000,
      max: 300,
      message: 'Too many requests. Please try again later.',
      prefix: 'global',
    });
  }
}
export default GlobalRateLimit.limiter();
