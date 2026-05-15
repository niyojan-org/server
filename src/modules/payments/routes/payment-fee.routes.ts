import { RequestHandler, Router } from 'express';
import { upsertFeeConfig, listFeeConfigs } from '../controllers/payment-fee-config.controller';
import { authenticate } from '@core/middlewares/auth.middleware';
import { organizationRole } from '@core/middlewares/organization.middleware';

const feeConfigRoutes = Router();

feeConfigRoutes.use(authenticate);
feeConfigRoutes.post(
  '/',
  organizationRole('owner', 'admin', 'manager') as RequestHandler,
  upsertFeeConfig,
);
feeConfigRoutes.get(
  '/:organizationId',
  organizationRole('owner', 'admin', 'manager') as RequestHandler,
  listFeeConfigs,
);

export default feeConfigRoutes;
