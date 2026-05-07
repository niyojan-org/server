import { asyncHandler } from '@core/utils/asyncHandler';
import { object, string } from 'zod';
import EventTicketsService from './event.tickets.services';
import { AddingTicketSchema } from './event.tickets.schema';
import { writeEventManagementAudit } from '../shared/event.management.audit';
import { findEventOrThrow } from '../shared/event.management.repository';
import { OrganizationRequest } from '@core/middlewares/organization.middleware';

const writeAudit = async (
  req: OrganizationRequest,
  eventId: string,
  action: string,
  targetId?: string,
  metadata?: Record<string, unknown>,
) => {
  const organizationId =
    req.user?.organization?.id ??
    (await findEventOrThrow(eventId)).organizationId.toString();
  writeEventManagementAudit({
    eventId,
    organizationId: organizationId.toString(),
    actorUserId: req.user?._id.toString() ?? 'unknown',
    actorRole: req.user?.organization?.role ?? req.user?.role ?? 'unknown',
    module: 'ticket',
    action,
    targetId,
    metadata,
    req,
  });
};

const getAllEventTickets = asyncHandler(async (req, res) => {
  const eventId = string({ message: 'Invalid event ID' }).parse(
    req.params.eventId,
  );
  const result = await EventTicketsService.getAllEventTickets(
    eventId,
    req.user.organization.role,
  );
  res
    .status(200)
    .json({ message: 'Event tickets retrieved successfully', result });
});

const getSingleEventTicket = asyncHandler(async (req, res) => {
  const { eventId, ticketId } = object({
    eventId: string({ message: 'Invalid event ID' }),
    ticketId: string({ message: 'Invalid ticket ID' }),
  }).parse(req.params);
  const result = await EventTicketsService.getSingleEventTicket(
    eventId,
    ticketId!,
    req.user.organization.role,
  );
  res
    .status(200)
    .json({ message: 'Event ticket retrieved successfully', result });
});

const addEventTicket = asyncHandler(async (req, res) => {
  const eventId = string({ message: 'Invalid event ID' }).parse(
    req.params.eventId,
  );
  const ticketData = AddingTicketSchema.parse(req.body);
  const result = await EventTicketsService.addEventTicket(eventId, ticketData);
  res.status(201).json({
    message: 'Event ticket created successfully',
    data: result,
  });
});

const updateEventTicket = asyncHandler(async (req, res) => {
  const { eventId, ticketId } = object({
    eventId: string({ message: 'Invalid event ID' }),
    ticketId: string({ message: 'Invalid ticket ID' }),
  }).parse(req.params);
  const ticketData = AddingTicketSchema.partial().parse(req.body);
  const updatedTicket = await EventTicketsService.updateEventTicket(
    eventId,
    ticketId!,
    ticketData,
  );
  await writeAudit(req, eventId, 'update', ticketId, {
    updatedFields: Object.keys(ticketData),
  });
  res.status(200).json({
    message: 'Event ticket updated successfully',
    data: updatedTicket,
  });
});

const toggleEventTicketStatus = asyncHandler(async (req, res) => {
  const { eventId, ticketId } = object({
    eventId: string({ message: 'Invalid event ID' }),
    ticketId: string({ message: 'Invalid ticket ID' }),
  }).parse(req.params);
  const toggledTicket = await EventTicketsService.toggleEventTicketStatus(
    eventId,
    ticketId!,
  );
  await writeAudit(req, eventId, 'toggle_status', ticketId, {
    isActive: toggledTicket.isActive,
  });
  res.status(200).json({
    message: 'Event ticket status updated successfully',
    data: toggledTicket,
  });
});

const deleteEventTicket = asyncHandler(async (req, res) => {
  const { eventId, ticketId } = object({
    eventId: string({ message: 'Invalid event ID' }),
    ticketId: string({ message: 'Invalid ticket ID' }),
  }).parse(req.params);
  await EventTicketsService.deleteEventTicket(eventId, ticketId);
  res.status(200).json({
    message: `Event ticket ${ticketId} deleted successfully`,
  });
});

export {
  addEventTicket,
  deleteEventTicket,
  getAllEventTickets,
  getSingleEventTicket,
  toggleEventTicketStatus,
  updateEventTicket,
};
