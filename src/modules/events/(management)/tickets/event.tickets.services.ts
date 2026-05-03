import ApiError from '@core/errors/api.error';
import { EventTicket } from '@modules/events/types';
import { OrganizationRole } from '@modules/events/views/event.role.view';
import {
  findEventOrThrow,
  findEventOrganizationOrThrow,
  resolveCollectionItemIndex,
  throwItemNotFound,
  updateEventCollection,
} from '../shared/event.management.repository';
import EventTicketsHelper from './events.tickets.helper';
import { AddingTicketInput } from './event.tickets.schema';

const findTicketOrThrow = (eventId: string, tickets: EventTicket[], ticketId: string) => {
  const index = resolveCollectionItemIndex(tickets, ticketId, 'type');
  if (index === -1 || !tickets[index]) {
    throwItemNotFound('ticket', ticketId, eventId);
  }
  return { index, ticket: tickets[index] as EventTicket };
};

export default class EventTicketsService {
  static async getAllEventTickets(eventId: string, role: OrganizationRole) {
    const event = await findEventOrThrow(eventId);
    return event.tickets.map((ticket) =>
      EventTicketsHelper.filterTicketData(role, ticket),
    );
  }

  static async getPublicEventTickets(eventId: string) {
    const event = await findEventOrThrow(eventId);
    return event.tickets
      .filter((ticket) => ticket.isActive)
      .map(EventTicketsHelper.buildPublicTicket);
  }

  static async getSingleEventTicket(
    eventId: string,
    ticketId: string,
    role?: OrganizationRole,
  ) {
    const event = await findEventOrThrow(eventId);
    const { ticket } = findTicketOrThrow(eventId, event.tickets, ticketId);
    if (!role && !ticket.isActive) {
      throwItemNotFound('ticket', ticketId, eventId);
    }
    return role
      ? EventTicketsHelper.filterTicketData(role, ticket)
      : EventTicketsHelper.buildPublicTicket(ticket);
  }

  static async addEventTicket(eventId: string, ticketData: AddingTicketInput) {
    const event = await findEventOrThrow(eventId);
    const organization = await findEventOrganizationOrThrow(event);
    const nextTicket = {
      ...ticketData,
      sold: 0,
      type: ticketData.type.trim().toUpperCase(),
    };
    EventTicketsHelper.validateTicket(event, nextTicket, true, organization);
    const updatedEvent = await updateEventCollection(eventId, 'tickets', [
      ...event.tickets,
      nextTicket as EventTicket,
    ]);
    return updatedEvent?.tickets ?? [];
  }

  static async updateEventTicket(
    eventId: string,
    ticketId: string,
    ticketData: Partial<EventTicket>,
  ) {
    const event = await findEventOrThrow(eventId);
    const organization = await findEventOrganizationOrThrow(event);
    const { index, ticket } = findTicketOrThrow(eventId, event.tickets, ticketId);
    const updatedTicket = {
      ...ticket,
      ...ticketData,
      type: ticketData.type?.trim().toUpperCase() ?? ticket.type,
    } as EventTicket;

    if (updatedTicket.capacity < ticket.sold) {
      throw new ApiError(
        400,
        'Ticket capacity cannot be less than sold count',
        'INVALID_TICKET_CAPACITY',
        `This ticket already has ${ticket.sold} sold seats.`,
      );
    }

    EventTicketsHelper.validateTicket(event, updatedTicket, false, organization);
    const tickets = [...event.tickets];
    tickets[index] = updatedTicket;
    const updatedEvent = await updateEventCollection(eventId, 'tickets', tickets);
    return updatedEvent?.tickets[index];
  }

  static async toggleEventTicketStatus(eventId: string, ticketId: string) {
    const event = await findEventOrThrow(eventId);
    const { index, ticket } = findTicketOrThrow(eventId, event.tickets, ticketId);
    const tickets = [...event.tickets];
    tickets[index] = { ...ticket, isActive: !ticket.isActive };
    await updateEventCollection(eventId, 'tickets', tickets);
    return tickets[index];
  }

  static async deleteEventTicket(eventId: string, ticketId: string) {
    const event = await findEventOrThrow(eventId);
    const { ticket } = findTicketOrThrow(eventId, event.tickets, ticketId);
    if (ticket.sold > 0) {
      throw new ApiError(
        400,
        'Cannot delete a ticket that already has sales',
        'TICKET_DELETE_FAILED',
        `This ticket already has ${ticket.sold} successful sales.`,
      );
    }
    await updateEventCollection(
      eventId,
      'tickets',
      event.tickets.filter((item) => item._id?.toString() !== ticket._id?.toString()),
    );
  }

  static async validateTicketPurchase(
    eventId: string,
    ticketId: string,
    quantity: number,
  ) {
    const event = await findEventOrThrow(eventId);
    const { ticket } = findTicketOrThrow(eventId, event.tickets, ticketId);
    const now = new Date();
    if (!ticket.isActive) throwItemNotFound('ticket', ticketId, eventId);
    if (ticket.salesStartTime > now || ticket.salesEndTime < now) {
      throw new ApiError(
        400,
        'Ticket sales are not active right now',
        'TICKET_SALES_CLOSED',
        'Use this ticket only inside its sales window.',
      );
    }
    if (ticket.sold + quantity > ticket.capacity) {
      throw new ApiError(
        400,
        'Not enough ticket inventory available',
        'TICKET_INVENTORY_EXHAUSTED',
        'Reduce the quantity or choose another ticket type.',
      );
    }
    return {
      ticket: EventTicketsHelper.buildPublicTicket(ticket),
      quantity,
      totalAmountPaisa: ticket.price * quantity,
    };
  }
}
