import { RequestHandler, Router } from 'express';
import { releaseSettlement } from '../controllers/settlement.controller';
import { authenticate } from '@core/middlewares/auth.middleware';
import { organizationRole } from '@core/middlewares/organization.middleware';

const settlementRoutes = Router();

settlementRoutes.use(authenticate);

settlementRoutes.use(
	organizationRole('owner', 'admin', 'manager', 'taskmaster') as RequestHandler,
);

settlementRoutes.post('/release', releaseSettlement);

export default settlementRoutes;
