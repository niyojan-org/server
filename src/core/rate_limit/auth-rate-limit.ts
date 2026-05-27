import type { RateLimitRequestHandler } from 'express-rate-limit';
import { BaseRateLimit } from './base-rate-limit';
export class AuthRateLimit extends BaseRateLimit {
  public static login(): RateLimitRequestHandler {
    return this.createLimiter({
      windowMs: 15 * 60 * 1000,
      max: 5,
      message: 'Too many login attempts. Please try again later.',
      prefix: 'login',
    });
  }

  public static register(): RateLimitRequestHandler {
    return this.createLimiter({
      windowMs: 15 * 60 * 1000,
      max: 3,
      message: 'Too many registration attempts.',
      prefix: 'register',
    });
  }

  public static forgotPassword(): RateLimitRequestHandler {
    return this.createLimiter({
      windowMs: 60 * 60 * 1000,
      max: 3,
      message: 'Too many password reset attempts.',
      prefix: 'forgot-password',
    });
  }
}
