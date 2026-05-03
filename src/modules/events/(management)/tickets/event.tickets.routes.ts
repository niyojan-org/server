import { authenticate } from '@core/middlewares/auth.middleware';
import { organizationRole } from '@core/middlewares/organization.middleware';
import { isTaskMaster } from '@core/middlewares/taskmaster.middleware';
import * as adminController from './event.tickets.admin.controller';
import * as publicController from './event.tickets.public.controller';
import express from 'express';

const eventTicketsRouter = express.Router();
const adminRouter = express.Router({ mergeParams: true });
const publicRouter = express.Router({ mergeParams: true });
const tmRouter = express.Router({ mergeParams: true });

publicRouter.get('/', publicController.getPublicEventTickets);
publicRouter.get('/:ticketId', publicController.getPublicEventTicket);
publicRouter.post('/validate', publicController.validateTicketPurchase);

adminRouter.use(authenticate);
adminRouter.get(
  '/',
  organizationRole('owner', 'admin', 'manager', 'volunteer', 'member'),
  adminController.getAllEventTickets,
);

adminRouter.get(
  '/:ticketId',
  organizationRole('owner', 'admin', 'manager', 'volunteer', 'member'),
  adminController.getSingleEventTicket,
);

adminRouter.post(
  '/',
  organizationRole('owner', 'admin', 'manager', 'volunteer'),
  adminController.addEventTicket,
);

adminRouter.put(
  '/:ticketId',
  organizationRole('owner', 'admin', 'manager', 'volunteer'),
  adminController.updateEventTicket,
);

adminRouter.patch(
  '/:ticketId/toggle-status',
  organizationRole('owner', 'admin', 'manager', 'volunteer'),
  adminController.toggleEventTicketStatus,
);

adminRouter.delete(
  '/:ticketId',
  organizationRole('owner', 'admin', 'manager'),
  adminController.deleteEventTicket,
);

tmRouter.use(authenticate, isTaskMaster());
tmRouter.get('/', adminController.getAllEventTickets);
tmRouter.get('/:ticketId', adminController.getSingleEventTicket);
tmRouter.post('/', adminController.addEventTicket);
tmRouter.put('/:ticketId', adminController.updateEventTicket);
tmRouter.patch(
  '/:ticketId/toggle-status',
  adminController.toggleEventTicketStatus,
);
tmRouter.delete('/:ticketId', adminController.deleteEventTicket);

eventTicketsRouter.use('/:eventId/admin', adminRouter);
eventTicketsRouter.use('/:eventId/tm', tmRouter);
eventTicketsRouter.use('/:eventId', publicRouter);

export default eventTicketsRouter;
