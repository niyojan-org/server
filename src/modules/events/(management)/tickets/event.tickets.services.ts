import ApiError from '@core/errors/api.error';
import { EventRepository } from '@modules/events/persistence/event.repository';
import { EventTicket } from '@modules/events/types';
import { OrganizationRole } from '@modules/events/views/event.role.view';
import { Organization } from '@modules/organization/types';
import EventTicketsRepository from './event.tickets.repository';
import EventsTicketsHelper from './events.tickets.helper';
import mongoose from 'mongoose';
import { AddingTicketInput } from './event.tickets.schema';

export default class EventTicketsService {
  static async getAllEventTickets(eventId: string, role: OrganizationRole) {
    const result = await EventTicketsRepository.getAllEventTickets(eventId);
    return result.map((ticket) =>
      EventsTicketsHelper.filterTicketData(role, ticket),
    );
  }
  static async getSingleEventTicket(
    eventId: string,
    ticketId: string,
    role: OrganizationRole,
  ) {
    const result = await EventTicketsRepository.getSingleEventTicket(
      eventId,
      ticketId,
    );
    if (!result)
      throw new ApiError(
        404,
        `Event ticket with ID ${ticketId} not found for event ${eventId}`,
        'EVENT_TICKET_NOT_FOUND',
        `No event ticket found with ID ${ticketId} for event ${eventId}`,
      );
    return EventsTicketsHelper.filterTicketData(role, result);
  }

  static async addEventTicket(
    eventId: string,
    ticketData: AddingTicketInput,
    organization: Organization,
  ) {
    ticketData.type = ticketData.type.trim().toUpperCase();
    const event = await EventRepository.find(eventId);
    if (!event) {
      throw new ApiError(
        404,
        'Event not found',
        'EVENT_NOT_FOUND',
        `No event found with ID ${eventId}`,
      );
    }
    EventsTicketsHelper.validateTicket(event, ticketData, true, organization);
    const updatedEvent = await EventTicketsRepository.updateEventTickets(
      eventId,
      [...event.tickets, ticketData as EventTicket],
    );
    return updatedEvent?.tickets;
  }

  static async updateEventTicket(
    eventId: string,
    ticketId: string,
    ticketData: Partial<EventTicket>,
    organization: Organization,
  ) {
    const event = await EventRepository.find(eventId);
    if (!event) {
      throw new ApiError(
        404,
        'Event not found',
        'EVENT_NOT_FOUND',
        `No event found with ID ${eventId}`,
      );
    }
    const { isObjectId } = this.resolveTicketMatch(ticketId);
    const ticketIndex = event.tickets.findIndex((ticket) =>
      isObjectId
        ? ticket._id?.toString() === ticketId
        : ticket.type === ticketId,
    );
    if (ticketIndex === -1) {
      throw new ApiError(
        404,
        `Event ticket with ID ${ticketId} not found for event ${eventId}`,
        'EVENT_TICKET_NOT_FOUND',
        `No event ticket found with ID ${ticketId} for event ${eventId}`,
      );
    }
    const originalTicket = event.tickets[ticketIndex];
    if (ticketData.type) {
      ticketData.type = ticketData.type.trim().toUpperCase();
      // Check for duplicate type if it was changed
      if (ticketData.type !== originalTicket?.type) {
        const duplicateType = event.tickets.find(
          (t) =>
            t.type.toUpperCase() === ticketData.type!.toUpperCase() &&
            t._id?.toString() !== originalTicket?._id?.toString(),
        );
        if (duplicateType) {
          throw new ApiError(
            400,
            `A ticket with the type "${ticketData.type}" already exists for this event`,
            'DUPLICATE_TICKET_TYPE',
            `Please choose a different name for the ticket type.`,
          );
        }
      }
    }
    const updatedTicket: EventTicket = {
      ...originalTicket,
      ...ticketData,
    } as EventTicket;

    if (updatedTicket.capacity < (originalTicket?.sold || 0)) {
      throw new ApiError(
        400,
        'Ticket capacity cannot be less than the number of tickets already sold',
        'INVALID_CAPACITY',
        `Cannot set capacity to ${updatedTicket.capacity} because ${originalTicket?.sold} tickets have already been sold.`,
      );
    }
    EventsTicketsHelper.validateTicket(
      event,
      updatedTicket,
      false,
      organization,
    );
    event.tickets[ticketIndex] = updatedTicket;
    const updatedEvent = await EventTicketsRepository.updateEventTickets(
      eventId,
      event.tickets,
    );
    return updatedEvent?.tickets[ticketIndex];
  }
  static async toggleEventTicketStatus(eventId: string, ticketId: string) {
    const event = await EventRepository.find(eventId);
    if (!event) {
      throw new ApiError(
        404,
        'Event not found',
        'EVENT_NOT_FOUND',
        `No event found with ID ${eventId}`,
      );
    }

    const { isObjectId } = this.resolveTicketMatch(ticketId);
    const ticketIndex = event.tickets.findIndex((t) =>
      isObjectId ? t._id?.toString() === ticketId : t.type === ticketId,
    );

    if (ticketIndex === -1 || !event.tickets[ticketIndex]) {
      throw new ApiError(
        404,
        `Event ticket with ID ${ticketId} not found for event ${eventId}`,
        'EVENT_TICKET_NOT_FOUND',
        `No event ticket found with ID ${ticketId} for event ${eventId}`,
      );
    }

    event.tickets[ticketIndex].isActive = !event.tickets[ticketIndex].isActive;
    await EventTicketsRepository.updateEventTickets(eventId, event.tickets);
    return event.tickets[ticketIndex];
  }

  static async deleteEventTicket(eventId: string, ticketId: string) {
    const result = await EventTicketsRepository.deleteEventTicket(
      eventId,
      ticketId,
    );
    if (result instanceof ApiError) {
      throw result;
    }
    if (!result) {
      throw new ApiError(
        404,
        `Event ticket with ID ${ticketId} not found for event ${eventId}`,
        'EVENT_TICKET_NOT_FOUND',
        `No event ticket found with ID ${ticketId} for event ${eventId}`,
      );
    }
    return result;
  }

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
}
