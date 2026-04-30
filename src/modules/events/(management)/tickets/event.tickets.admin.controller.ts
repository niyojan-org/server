import { asyncHandler } from '@core/utils/asyncHandler';
import z from 'zod';
import EventTicketsService from './event.tickets.services';
import { AddingTicketSchema } from './event.tickets.schema';

const getAllEventTickets = asyncHandler(async (req, res) => {
  const eventId = z
    .string({ message: 'Invalid event ID' })
    .parse(req.params.eventId);
  const result = await EventTicketsService.getAllEventTickets(
    eventId,
    req.user?.organization?.role,
  );
  res.status(200).json({
    message: 'All event tickets retrieved successfully for ' + eventId,
    data: result,
  });
});

const getSingleEventTicket = asyncHandler(async (req, res) => {
  const { eventId, ticketId } = z
    .object({
      eventId: z.string({ message: 'Invalid event ID' }),
      ticketId: z.string({ message: 'Invalid ticket ID' }),
    })
    .parse(req.params);
  const result = await EventTicketsService.getSingleEventTicket(
    eventId,
    ticketId,
    req.user.organization.role,
  );
  res.status(200).json({
    message: `Event ticket with ID ${ticketId} retrieved successfully`,
    data: result,
  });
});

const addEventTicket = asyncHandler(async (req, res) => {
  const eventId = z
    .string({ message: 'Invalid event ID' })
    .parse(req.params.eventId);
  const ticketData = AddingTicketSchema.parse(req.body);
  const result = await EventTicketsService.addEventTicket(
    eventId,
    ticketData,
    req.organization,
  );
  res.status(201).json({
    message: `New ticket added successfully`,
    data: result,
  });
});

const updateEventTicket = asyncHandler(async (req, res) => {
  const { eventId, ticketId } = z
    .object({
      eventId: z.string({ message: 'Invalid event ID' }),
      ticketId: z.string({ message: 'Invalid ticket ID' }),
    })
    .parse(req.params);
  const ticketData = AddingTicketSchema.partial().parse(req.body);
  const updatedTicket = await EventTicketsService.updateEventTicket(
    eventId,
    ticketId,
    ticketData,
    req.organization,
  );
  res.status(200).json({
    message: `Event ticket with ID ${ticketId} updated successfully`,
    data: updatedTicket,
  });
});

const toggleEventTicketStatus = asyncHandler(async (req, res) => {
  const { eventId, ticketId } = z
    .object({
      eventId: z.string({ message: 'Invalid event ID' }),
      ticketId: z.string({ message: 'Invalid ticket ID' }),
    })
    .parse(req.params);
  const toggledTicket = await EventTicketsService.toggleEventTicketStatus(
    eventId,
    ticketId,
  );
  res.status(200).json({
    message: `Event ticket with ID ${ticketId} status toggled successfully`,
    data: toggledTicket,
  });
});

const deleteEventTicket = asyncHandler(async (req, res) => {
  const { eventId, ticketId } = z
    .object({
      eventId: z.string({ message: 'Invalid event ID' }),
      ticketId: z.string({ message: 'Invalid ticket ID' }),
    })
    .parse(req.params);
  await EventTicketsService.deleteEventTicket(eventId, ticketId);
  res.status(200).json({
    message: `Event ticket ${ticketId} deleted successfully`,
  });
});

export {
  getAllEventTickets,
  getSingleEventTicket,
  addEventTicket,
  updateEventTicket,
  toggleEventTicketStatus,
  deleteEventTicket,
};
