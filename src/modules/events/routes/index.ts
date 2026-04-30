import { authenticate } from '@core/middlewares/auth.middleware';
import { Router } from 'express';
import eventAdminRoutes from './event.admin.routes';
import eventTicketsRouter from '../(management)/tickets/event.tickets.routes';

const eventRoutes = Router();

eventRoutes.use('/admin', authenticate, eventAdminRoutes);
eventRoutes.use('/tickets', eventTicketsRouter);

export default eventRoutes;
