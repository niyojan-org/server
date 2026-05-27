import { Router } from 'express';
import { EventPublicController } from '../controllers/event-public.controller';
import { PublicApiRateLimit } from '@core/rate_limit/public-api-rate-limit';

const EventPublicRoutes = Router();

EventPublicRoutes.get('/', PublicApiRateLimit.listPublicEvents(), EventPublicController.listPublicEvents);
EventPublicRoutes.get('/:eventId', PublicApiRateLimit.getPublicEvent(), EventPublicController.getPublicEvent);

export default EventPublicRoutes;
