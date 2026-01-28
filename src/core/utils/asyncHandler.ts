import type { RequestHandler, Response, NextFunction } from "express";

export function asyncHandler<Req extends any = any>(
  fn: (req: Req, res: Response, next: NextFunction) => Promise<any>
): RequestHandler {
  return (req, res, next) => {
    Promise.resolve(fn(req as Req, res, next)).catch(next);
  };
}
