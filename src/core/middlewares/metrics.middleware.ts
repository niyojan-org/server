import { Request, Response, NextFunction } from 'express';
import { httpRequestDuration, httpRequestsTotal } from '../../metrics';
import logger from '@config/logger';

export const metricsMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;

    const route = req.route?.path || req.path;

    const ip =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0] ||
      req.socket.remoteAddress;

    httpRequestDuration
      .labels(req.method, route, res.statusCode.toString())
      .observe(duration);

    httpRequestsTotal
      .labels(req.method, route, res.statusCode.toString())
      .inc();

    if (route !== '/metrics') {
      const durationMs = duration * 1000;
      logger.info(
        JSON.stringify({
          message: `http_request`,
          method: req.method,
          route,
          status: res.statusCode,
          duration,
          durationMs,
          ip,
          userAgent: req.headers['user-agent'],
        }),
      );
    }
  });

  next();
};
