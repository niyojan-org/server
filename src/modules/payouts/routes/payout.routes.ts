import { RequestHandler, Router } from 'express';
import {
  createPayout,
  markPayoutFailed,
  markPayoutSuccess,
} from '../controllers/payout.controller';
import { authenticate } from '@core/middlewares/auth.middleware';
import { organizationRole } from '@core/middlewares/organization.middleware';
import { requireRole } from '@core/middlewares/role.middleware';

const payoutRoutes = Router();

payoutRoutes.use(authenticate);

payoutRoutes.post(
  '/',
  organizationRole('owner', 'admin', 'manager') as RequestHandler,
  createPayout,
);

payoutRoutes.post(
  '/:payoutId/success',
  requireRole('taskmaster', 'admin') as RequestHandler,
  markPayoutSuccess,
);
payoutRoutes.post(
  '/:payoutId/failed',
  requireRole('taskmaster', 'admin') as RequestHandler,
  markPayoutFailed,
);

export default payoutRoutes;
