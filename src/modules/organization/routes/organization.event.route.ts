import { asyncHandler } from '@core/utils/asyncHandler';
import { RequestHandler, Router } from 'express';
import { checkEventCreationStatus } from '../service/admin/organization.event.service';
import { organizationRole } from '@core/middlewares/organization.middleware';

const organizationEventRouter = Router();

organizationEventRouter.get(
  '/creation-status',
  organizationRole('owner', 'admin') as RequestHandler,
  asyncHandler(async (req, res) => {
    const org = req.organization;
    const result = await checkEventCreationStatus(org);
    res.json(result);
  }),
);

export default organizationEventRouter;
