import ApiError from '@core/errors/api.error';
import { EventModel } from '@modules/events/persistence/event.model';
import { EventTicket } from '@modules/events/types';
import mongoose from 'mongoose';

export default class EventTicketsRepository {
  private static resolveTicketMatch(ticketId: string) {
    const isObjectId = mongoose.Types.ObjectId.isValid(ticketId);
    return {
      isObjectId,
      query: isObjectId
        ? { _id: new mongoose.Types.ObjectId(ticketId) }
        : { type: ticketId },
      matchKey: isObjectId ? '_id' : 'type',
    };
  }
  static async getAllEventTickets(eventId: string) {
    const isObjectId = mongoose.Types.ObjectId.isValid(eventId);
    const query = isObjectId ? { _id: eventId } : { slug: eventId };
    const tickets = await EventModel.findOne(query, { tickets: 1 }).lean();
    return tickets?.tickets || [];
  }
  static async getSingleEventTicket(eventId: string, ticketId: string) {
    const isObjectId = mongoose.Types.ObjectId.isValid(eventId);
    const query = isObjectId ? { _id: eventId } : { slug: eventId };
    const event = await EventModel.findOne(query, { tickets: 1 }).lean();
    if (!event) return null;
    const { isObjectId: isTicketObjectId } = this.resolveTicketMatch(ticketId);
    return event.tickets.find((ticket) =>
      isTicketObjectId
        ? ticket._id?.toString() === ticketId
        : ticket.type === ticketId,
    );
  }
  static async updateEventTickets(eventId: string, tickets: EventTicket[]) {
    const isObjectId = mongoose.Types.ObjectId.isValid(eventId);
    const query = isObjectId ? { _id: eventId } : { slug: eventId };
    const updatedEvent = await EventModel.findOneAndUpdate(
      query,
      { tickets },
      { new: true },
    ).lean();
    return updatedEvent;
  }
  static async deleteEventTicket(eventId: string, ticketId: string) {
    const isEventObjectId = mongoose.Types.ObjectId.isValid(eventId);
    const eventQuery = isEventObjectId ? { _id: eventId } : { slug: eventId };
    const { isObjectId } = this.resolveTicketMatch(ticketId);
    const event = await EventModel.findOne(eventQuery, { tickets: 1 }).lean();
    if (!event) return null;
    const ticket = event.tickets.find((t) =>
      isObjectId ? t._id?.toString() === ticketId : t.type === ticketId,
    );
    if (!ticket) return null;
    if (ticket.sold > 0)
      return new ApiError(
        400,
        'Cannot delete ticket that has been sold',
        'TICKET_DELETE_FAILED',
        `Cannot delete ticket with ID ${ticketId} as it has already been sold (${ticket.sold} sold)`,
      );
    const updatedTickets = event.tickets.filter((t) =>
      isObjectId ? t._id?.toString() !== ticketId : t.type !== ticketId,
    );
    const result = await EventModel.updateOne(eventQuery, {
      tickets: updatedTickets,
    }).lean();
    return result;
  }
}
