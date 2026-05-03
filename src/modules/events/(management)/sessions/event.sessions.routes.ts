import { authenticate } from '@core/middlewares/auth.middleware';
import { organizationRole } from '@core/middlewares/organization.middleware';
import { isTaskMaster } from '@core/middlewares/taskmaster.middleware';
import express from 'express';
import * as adminController from './event.sessions.admin.controller';
import * as publicController from './event.sessions.public.controller';

const eventSessionsRouter = express.Router();
const adminRouter = express.Router({ mergeParams: true });
const publicRouter = express.Router({ mergeParams: true });
const tmRouter = express.Router({ mergeParams: true });

publicRouter.get('/', publicController.getPublicEventSessions);
publicRouter.get('/:sessionId', publicController.getPublicEventSession);

adminRouter.use(authenticate);
adminRouter.get(
  '/',
  organizationRole('owner', 'admin', 'manager', 'volunteer', 'member'),
  adminController.getAllEventSessions,
);
adminRouter.get(
  '/:sessionId',
  organizationRole('owner', 'admin', 'manager', 'volunteer', 'member'),
  adminController.getSingleEventSession,
);
adminRouter.post(
  '/',
  organizationRole('owner', 'admin', 'manager', 'volunteer'),
  adminController.addEventSession,
);
adminRouter.put(
  '/:sessionId',
  organizationRole('owner', 'admin', 'manager', 'volunteer'),
  adminController.updateEventSession,
);
adminRouter.patch(
  '/:sessionId/toggle-status',
  organizationRole('owner', 'admin', 'manager', 'volunteer'),
  adminController.toggleEventSessionStatus,
);
adminRouter.delete(
  '/:sessionId',
  organizationRole('owner', 'admin', 'manager'),
  adminController.deleteEventSession,
);

tmRouter.use(authenticate, isTaskMaster());
tmRouter.get('/', adminController.getAllEventSessions);
tmRouter.get('/:sessionId', adminController.getSingleEventSession);
tmRouter.post('/', adminController.addEventSession);
tmRouter.put('/:sessionId', adminController.updateEventSession);
tmRouter.patch('/:sessionId/toggle-status', adminController.toggleEventSessionStatus);
tmRouter.delete('/:sessionId', adminController.deleteEventSession);

eventSessionsRouter.use('/:eventId/admin', adminRouter);
eventSessionsRouter.use('/:eventId/tm', tmRouter);
eventSessionsRouter.use('/:eventId', publicRouter);

export default eventSessionsRouter;
