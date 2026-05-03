import { asyncHandler } from '@core/utils/asyncHandler';
import z from 'zod';
import EventTicketsService from './event.tickets.services';
import {
  AddingTicketSchema,
  UpdatingTicketSchema,
} from './event.tickets.schema';
import { writeEventManagementAudit } from '../shared/event.management.audit';
import { findEventOrThrow } from '../shared/event.management.repository';
import { OrganizationRequest } from '@core/middlewares/organization.middleware';

const TicketParamsSchema = z.object({
  eventId: z.string().min(1, 'Invalid event ID'),
  ticketId: z.string().min(1, 'Invalid ticket ID').optional(),
});

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
  const { eventId } = TicketParamsSchema.parse(req.params);
  const data = await EventTicketsService.getAllEventTickets(
    eventId,
    req.user.organization.role,
  );
  res
    .status(200)
    .json({ message: 'Event tickets retrieved successfully', data });
});

const getSingleEventTicket = asyncHandler(async (req, res) => {
  const { eventId, ticketId } = TicketParamsSchema.parse(req.params);
  const data = await EventTicketsService.getSingleEventTicket(
    eventId,
    ticketId!,
    req.user.organization.role,
  );
  res
    .status(200)
    .json({ message: 'Event ticket retrieved successfully', data });
});

const addEventTicket = asyncHandler(async (req, res) => {
  const { eventId } = TicketParamsSchema.parse(req.params);
  const payload = AddingTicketSchema.parse(req.body);
  const data = await EventTicketsService.addEventTicket(eventId, payload);
  await writeAudit(req, eventId, 'add', undefined, {
    ticketType: payload.type,
  });
  res.status(201).json({ message: 'Event ticket created successfully', data });
});

const updateEventTicket = asyncHandler(async (req, res) => {
  const { eventId, ticketId } = TicketParamsSchema.parse(req.params);
  const payload = UpdatingTicketSchema.parse(req.body);
  const data = await EventTicketsService.updateEventTicket(
    eventId,
    ticketId!,
    payload,
  );
  await writeAudit(req, eventId, 'update', ticketId, {
    updatedFields: Object.keys(payload),
  });
  res.status(200).json({ message: 'Event ticket updated successfully', data });
});

const toggleEventTicketStatus = asyncHandler(async (req, res) => {
  const { eventId, ticketId } = TicketParamsSchema.parse(req.params);
  const data = await EventTicketsService.toggleEventTicketStatus(
    eventId,
    ticketId!,
  );
  await writeAudit(req, eventId, 'toggle_status', ticketId, {
    isActive: data.isActive,
  });
  res
    .status(200)
    .json({ message: 'Event ticket status updated successfully', data });
});

const deleteEventTicket = asyncHandler(async (req, res) => {
  const { eventId, ticketId } = TicketParamsSchema.parse(req.params);
  await EventTicketsService.deleteEventTicket(eventId, ticketId!);
  await writeAudit(req, eventId, 'delete', ticketId, undefined);
  res.status(200).json({ message: 'Event ticket deleted successfully' });
});

export {
  addEventTicket,
  deleteEventTicket,
  getAllEventTickets,
  getSingleEventTicket,
  toggleEventTicketStatus,
  updateEventTicket,
};
