import { authenticate } from '@core/middlewares/auth.middleware';
import { Router } from 'express';
import eventAdminRoutes from './event.admin.routes';
import eventCouponsRouter from '../(management)/coupons/event.coupons.routes';
import eventSessionsRouter from '../(management)/sessions/event.sessions.routes';
import eventTicketsRouter from '../(management)/tickets/event.tickets.routes';

const eventRoutes = Router();

eventRoutes.use('/admin', authenticate, eventAdminRoutes);
eventRoutes.use('/coupons', eventCouponsRouter);
eventRoutes.use('/sessions', eventSessionsRouter);
eventRoutes.use('/tickets', eventTicketsRouter);

export default eventRoutes;
