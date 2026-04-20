import { Router } from 'express';
import * as eventAdminController from '../controllers/admin/event.admin.controller';
import { organizationRole } from '@core/middlewares/organization.middleware';
import { validate } from '@core/middlewares/validate.middleware';
import { EventSchema } from '../core/event.zod';

const eventAdminRoutes = Router();

eventAdminRoutes.get(
  '/',
  organizationRole(
    'owner',
    'admin',
    'member',
    'manager',
    'volunteer',
    'system',
  ),
  eventAdminController.getEvents,
);

eventAdminRoutes.get(
  '/:id',
  organizationRole(
    'owner',
    'admin',
    'member',
    'manager',
    'volunteer',
    'system',
  ),
  eventAdminController.getEventById,
);

eventAdminRoutes.post(
  '/create',
  organizationRole('owner', 'admin'),
  validate({ body: EventSchema }),
  eventAdminController.createEvent,
);

export default eventAdminRoutes;
