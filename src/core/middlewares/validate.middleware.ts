import type { Request, Response, NextFunction } from "express";
import type { ZodObject, ZodType } from "zod";
import ApiError from "@core/errors/api.error";

/**
 * What parts of the request can be validated
 */
type ValidationTarget = "body" | "query" | "params";

interface ValidateOptions {
  body?: ZodObject<any> | ZodType<any>;
  query?: ZodObject<any> | ZodType<any>;
  params?: ZodObject<any> | ZodType<any>;
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
        Object.keys(validated).forEach((key) => {
          (req.query as any)[key] = validated[key];
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

export const jsonValidation = (err: any, req: Request, _res: Response, next: NextFunction) => {
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
