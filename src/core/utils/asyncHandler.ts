import type { RequestHandler, Response, NextFunction } from 'express';

/* eslint-disable @typescript-eslint/no-explicit-any */
export function asyncHandler<Req = any>(
  fn: (req: Req, res: Response, next: NextFunction) => Promise<any>,
): RequestHandler {
  return (req, res, next) => {
    Promise.resolve(fn(req as Req, res, next)).catch(next);
  };
}
/* eslint-enable @typescript-eslint/no-explicit-any */
