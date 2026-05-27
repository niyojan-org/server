import helmetMiddleware from '@config/helmet';
import ApiError from '@core/errors/api.error';
import corsMiddleware from '@core/middlewares/cors.middleware';
import { errorMiddleware } from '@core/middlewares/error.middleware';
import { jsonValidation } from '@core/middlewares/validate.middleware';
import mainRoutes from '@routes';
import cookieParser from 'cookie-parser';
import express, { Request, Response } from 'express';
import { register } from './metrics';
import { metricsMiddleware } from '@core/middlewares/metrics.middleware';
import env from '@config/env';
import globalRateLimit from '@core/rate_limit/global-rate-limit';

const app = express();

app.disable('x-powered-by');
app.set('trust proxy', 1);

//MIDDLEWARES
app.use(helmetMiddleware);
app.use(corsMiddleware);
app.use(
  express.json({
    verify: (req, _res, buf) => {
      (req as { rawBody?: string }).rawBody = buf.toString('utf8');
    },
  }),
);
app.use(jsonValidation);
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(globalRateLimit);
app.use(metricsMiddleware);

//BOOTSTRAP
import('./bootstrap');

app.get('/', (_req: Request, res: Response) => {
  res.status(200).json({ message: 'Welcome to Orgatick Server' });
});

app.get('/metrics', async (req, res) => {
  if (req.ip !== env.METRICS_ALLOWED_IP) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

app.use('/', mainRoutes);

app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'OK', message: 'Server is healthy', timestamp: new Date().toISOString() });
});

app.use(() => {
  throw new ApiError(404, 'Route not found', 'ROUTE_NOT_FOUND', 'The requested endpoint route does not exist.');
});
app.use(errorMiddleware);
export default app;
