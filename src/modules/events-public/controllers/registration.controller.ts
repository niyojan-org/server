import ApiError from '@core/errors/api.error';
import { asyncHandler } from '@core/utils/asyncHandler';
import { EventRepository } from '@modules/events/persistence/event.repository';
import { string } from 'zod';

class EventPublicRegistrationController {
  static getRegistrationChallenge = asyncHandler(async (req, res) => {
    const eventId = string({ message: 'Need a vaild EventId' }).min(3).parse(req.params.eventId);
    const event = await EventRepository.findByIdOrSlug(eventId);
    if (!event) throw new ApiError(404, 'Event not found', 'EVENT_NOT_FOUND', 'The requested event was not found');
    if (!event.isPublished)
      throw new ApiError(403, 'Event not published', 'EVENT_NOT_PUBLISHED', 'The requested event is not published yet');
    
  });
}

export default EventPublicRegistrationController;
