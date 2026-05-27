import type { RateLimitRequestHandler } from 'express-rate-limit';
import { BaseRateLimit } from './base-rate-limit';

export class RegistrationRateLimit extends BaseRateLimit {
  public static createRegistration(): RateLimitRequestHandler {
    return this.createLimiter({
      windowMs: 60 * 60 * 1000, // 1 hour
      max: 10,
      message: 'Too many registration attempts. Please try again later.',
      prefix: 'registration',
    });
  }

  public static getForm(): RateLimitRequestHandler {
    return this.createLimiter({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 50,
      message: 'Too many form requests. Please try again later.',
      prefix: 'registration-form',
    });
  }
}
