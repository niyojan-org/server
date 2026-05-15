import env from '@config/env';
import ApiError from '@core/errors/api.error';
import { validateDomainPurpose } from '@modules/domain';
import cors from 'cors';

// function normalizeOrigin(origin: string): string {
//   try {
//     const url = new URL(origin);
//     return url.hostname;
//   } catch {
//     return origin;
//   }
// }

const corsMiddleware = cors({
  origin: async (origin, callback) => {
    try {
      if (!origin) {
        return callback(null, true);
      }
      await validateDomainPurpose(origin, env.NODE_ENV, 'cors');
      return callback(null, true);
    } catch {
      return callback(
        new ApiError(
          403,
          'CORS Error: Access denied from this origin',
          'CORS_ERROR',
          'Cross-origin request blocked from this origin',
        ),
        false,
      );
    }
  },
  credentials: true, // Allow cookies and credentials
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['X-Requested-Id'],

  maxAge: 43200, // 12 hours
});

export default corsMiddleware;
