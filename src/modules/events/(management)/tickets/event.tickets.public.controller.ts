import { asyncHandler } from '@core/utils/asyncHandler';
import z from 'zod';
import EventTicketsService from './event.tickets.services';
import { TicketPurchaseValidationSchema } from './event.tickets.schema';

const TicketParamsSchema = z.object({
  eventId: z.string().min(1, 'Invalid event ID'),
  ticketId: z.string().min(1, 'Invalid ticket ID').optional(),
});

const getPublicEventTickets = asyncHandler(async (req, res) => {
  const { eventId } = TicketParamsSchema.parse(req.params);
  const data = await EventTicketsService.getPublicEventTickets(eventId);
  res.status(200).json({ message: 'Public event tickets retrieved successfully', data });
});

const getPublicEventTicket = asyncHandler(async (req, res) => {
  const { eventId, ticketId } = TicketParamsSchema.parse(req.params);
  const data = await EventTicketsService.getSingleEventTicket(eventId, ticketId!);
  res.status(200).json({ message: 'Public event ticket retrieved successfully', data });
});

const validateTicketPurchase = asyncHandler(async (req, res) => {
  const { eventId } = TicketParamsSchema.parse(req.params);
  const { ticketId, quantity } = TicketPurchaseValidationSchema.parse(req.body);
  const data = await EventTicketsService.validateTicketPurchase(
    eventId,
    ticketId,
    quantity,
  );
  res.status(200).json({ message: 'Ticket purchase validated successfully', data });
});

export { getPublicEventTicket, getPublicEventTickets, validateTicketPurchase };
