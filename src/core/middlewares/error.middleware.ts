import logger from "@config/logger";
import ApiError from "@core/errors/api.error";
import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";

export function errorMiddleware(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ZodError) {
    const firstError = err.issues[0];
    return res.status(400).json({
      success: false,
      status: 400,
      message: firstError?.message ?? "Validation Error",
      error: {
        code: "VALIDATION_ERROR",
        details: err.issues.map((issue) => ({
          field: issue.path.join(".") || "unknown",
          message: issue.message,
        })),
      },
    });
  }

  if (err instanceof ApiError) {
    return res.status(err.status).json({
      success: false,
      status: err.status,
      message: err.message,
      error: {
        code: err.code,
        details: err.details,
      },
    });
  }

  // Handle other errors
  logger.error("Unhandled error:", err);
  return res.status(500).json({
    success: false,
    status: 500,
    message: "Internal Server Error",
    error: {
      code: "INTERNAL_ERROR",
      details: "An unexpected error occurred.",
    },
  });
}
