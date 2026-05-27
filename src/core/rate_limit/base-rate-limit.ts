import rateLimit, { type RateLimitRequestHandler } from 'express-rate-limit';
import { RedisStore, type RedisReply } from 'rate-limit-redis';
import type { Request, Response } from 'express';
import redis from '@config/redis';
import { ROUTES_TO_SKIP } from './rate-limit-constants';
import ApiError from '@core/errors/api.error';
import env from '@config/env';

interface RateLimitConfig {
  windowMs: number;
  max: number;
  message: string;
  prefix: string;
}

export abstract class BaseRateLimit {
  private static redis = redis;
  protected static createLimiter(config: RateLimitConfig): RateLimitRequestHandler {
    return rateLimit({
      windowMs: config.windowMs,
      max: config.max,
      standardHeaders: true,
      legacyHeaders: false,
      validate: {
        trustProxy: false,
      },
      message: {
        success: false,
        message: config.message,
      },
      store: new RedisStore({
        prefix: `rl:${config.prefix}:`,
        sendCommand: (...args: string[]): Promise<RedisReply> => {
          const [command, ...commandArgs] = args;
          if (!command) {
            return Promise.reject(new Error('Redis command is required.'));
          }
          return BaseRateLimit.redis.call(command, commandArgs) as Promise<RedisReply>;
        },
      }),

      handler: (): Response => {
        throw new ApiError(429, config.message, 'RATE_LIMIT_EXCEEDED', 'Too many requests, please try again later.');
      },

      skip: (req: Request): boolean => {
        if (env.NODE_ENV === 'test' || env.NODE_ENV === 'development') {
          return true;
        }
        return req.path in ROUTES_TO_SKIP;
      },
    });
  }
}
