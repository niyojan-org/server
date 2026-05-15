import type { Request, Response, NextFunction } from "express";
import type { ZodObject, ZodTypeAny } from "zod";
import ApiError from "@core/errors/api.error";

interface ValidateOptions {
  body?: ZodObject<ZodTypeAny> | ZodTypeAny;
  query?: ZodObject<ZodTypeAny> | ZodTypeAny;
  params?: ZodObject<ZodTypeAny> | ZodTypeAny;
}

/**
 * validate()
 * ------------------------------------------------------------------
 * - Centralized Zod validation middleware
 * - NO response handling here
 * - Errors are forwarded to global error middleware
 */
export const validate =
  (schemas: ValidateOptions) => (req: Request, _res: Response, next: NextFunction) => {
    try {
      if (schemas.body) {
        req.body = schemas.body.parse(req.body);
      }

      if (schemas.query) {
        // Validate query but assign to req.query by copying properties
        const validated = schemas.query.parse(req.query);
        const queryTarget = req.query as Record<string, unknown>;
        Object.keys(validated).forEach((key) => {
          queryTarget[key] = validated[key as keyof typeof validated];
        });
      }

      if (schemas.params) {
        req.params = schemas.params.parse(req.params);
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
  if (err instanceof SyntaxError && 'body' in err && err.message.includes('JSON')) {
    throw new ApiError(
      400,
      "Invalid JSON in request body",
      "INVALID_JSON",
      err.message
    );
  }
  next(err);
};
