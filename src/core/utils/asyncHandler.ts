import type { Request, Response, NextFunction, RequestHandler } from 'express'

/**
 * Wraps an async Express handler and forwards errors
 * to the global error middleware.
 *
 * Usage:
 *   export const handler = asyncHandler(async (req, res) => { ... })
 */
export function asyncHandler<
  P = any,
  ResBody = any,
  ReqBody = any,
  ReqQuery = any
>(
  fn: (
    req: Request<P, ResBody, ReqBody, ReqQuery>,
    res: Response<ResBody>,
    next: NextFunction
  ) => Promise<any>
): RequestHandler<P, ResBody, ReqBody, ReqQuery> {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
} 