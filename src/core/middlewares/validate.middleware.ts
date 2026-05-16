import type { Request, Response, NextFunction } from 'express';
import type { ZodTypeAny } from 'zod';
import ApiError from '@core/errors/api.error';

interface ValidateOptions {
  body?: ZodTypeAny;
  query?: ZodTypeAny;
  params?: ZodTypeAny;
}

/**
 * validate()
 * ------------------------------------------------------------------
 * - Centralized Zod validation middleware
 * - NO response handling here
 * - Errors are forwarded to global error middleware
 */
export const validate =
  (schemas: ValidateOptions) =>
  (req: Request, _res: Response, next: NextFunction) => {
    try {
      if (schemas.body) {
        req.body = schemas.body.parse(req.body);
      }

      if (schemas.query) {
        // Validate query but assign to req.query by copying properties
        const validated = schemas.query.parse(req.query);
        if (
          validated &&
          typeof validated === 'object' &&
          !Array.isArray(validated)
        ) {
          const validatedRecord = validated as Record<string, unknown>;
          const queryTarget = req.query as Record<string, unknown>;
          Object.keys(validatedRecord).forEach((key) => {
            queryTarget[key] = validatedRecord[key];
          });
        } else {
          req.query = validated as typeof req.query;
        }
      }

      if (schemas.params) {
        const parsed = schemas.params.parse(req.params);
        req.params = parsed as typeof req.params;
      }

      next();
    } catch (error) {
      next(error);
    }
  };

export const jsonValidation = (
  err: unknown,
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  if (
    err instanceof SyntaxError &&
    'body' in err &&
    err.message.includes('JSON')
  ) {
    throw new ApiError(
      400,
      'Invalid JSON in request body',
      'INVALID_JSON',
      err.message,
    );
  }
  next(err);
};
