import { Router } from 'express';
import { EventPublicController } from '../controllers/event-public.controller';

const EventPublicRoutes = Router();

EventPublicRoutes.get('/', EventPublicController.listPublicEvents);
EventPublicRoutes.get('/:eventId', EventPublicController.getPublicEvent);

export default EventPublicRoutes;
