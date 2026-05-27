import type { RateLimitRequestHandler } from 'express-rate-limit';
import { BaseRateLimit } from './base-rate-limit';

export class PublicApiRateLimit extends BaseRateLimit {
  public static listPublicEvents(): RateLimitRequestHandler {
    return this.createLimiter({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100,
      message: 'Too many requests. Please try again later.',
      prefix: 'public-events',
    });
  }

  public static getPublicEvent(): RateLimitRequestHandler {
    return this.createLimiter({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 200,
      message: 'Too many requests. Please try again later.',
      prefix: 'public-event',
    });
  }

  public static listPublicResources(): RateLimitRequestHandler {
    return this.createLimiter({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 150,
      message: 'Too many requests. Please try again later.',
      prefix: 'public-resources',
    });
  }

  public static getPublicResource(): RateLimitRequestHandler {
    return this.createLimiter({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 200,
      message: 'Too many requests. Please try again later.',
      prefix: 'public-resource',
    });
  }
}
