import { isObjectId } from '@helpers/zod';
import { EventModel } from '@modules/events/persistence/event.model';
import { EventTicket } from '@modules/events/types';
import mongoose, { Types } from 'mongoose';

type GetTicketResult = EventTicket & {
  eventId: mongoose.Types.ObjectId;
};

class TicketRepository {
  static async getTicketByIdOrType(
    eventIdOrSlug: string,
    ticketIdOrType: string,
  ): Promise<GetTicketResult | null> {
    const isEventIdObjectId = isObjectId(eventIdOrSlug);
    const IsTicketIdObjectId = isObjectId(ticketIdOrType);
    const query: Record<string, unknown> = {};
    if (isEventIdObjectId) {
      query._id = new Types.ObjectId(eventIdOrSlug);
    } else {
      query.slug = eventIdOrSlug;
    }
    if (IsTicketIdObjectId) {
      query['tickets._id'] = new Types.ObjectId(ticketIdOrType);
    } else {
      query['tickets.type'] = ticketIdOrType;
    }
    const event = await EventModel.findOne(query, { 'tickets.$': 1 }).lean();
    if (!event) return null;
    return {
      ...(event.tickets[0] as EventTicket),
      eventId: event._id,
    };
  }
}

export default TicketRepository;
