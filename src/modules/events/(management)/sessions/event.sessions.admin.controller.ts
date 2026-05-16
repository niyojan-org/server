import { asyncHandler } from '@core/utils/asyncHandler';
import z from 'zod';
import {
  AddingSessionSchema,
  UpdatingSessionSchema,
} from './event.sessions.schema';
import EventSessionsService from './event.sessions.services';
import { writeEventManagementAudit } from '../shared/event.management.audit';
import { findEventOrThrow } from '../shared/event.management.repository';
import { AuthenticatedRequest } from '@core/middlewares/auth.middleware';

const SessionParamsSchema = z.object({
  eventId: z.string().min(1, 'Invalid event ID'),
  sessionId: z.string().min(1, 'Invalid session ID').optional(),
});

const writeAudit = async (
  req: AuthenticatedRequest,
  eventId: string,
  action: string,
  targetId?: string,
) => {
  const organizationId = (
    req.user.organization?.id ?? (await findEventOrThrow(eventId)).organizationId
  ).toString();
  writeEventManagementAudit({
    eventId,
    organizationId,
    actorUserId: req.user._id.toString(),
    actorRole: req.user.organization?.role ?? req.user.role,
    module: 'session',
    action,
    targetId,
    req,
  });
};

const getAllEventSessions = asyncHandler(async (req, res) => {
  const { eventId } = SessionParamsSchema.parse(req.params);
  const data = await EventSessionsService.getAllEventSessions(eventId);
  res.status(200).json({ message: 'Event sessions retrieved successfully', data });
});

const getSingleEventSession = asyncHandler(async (req, res) => {
  const { eventId, sessionId } = SessionParamsSchema.parse(req.params);
  const data = await EventSessionsService.getSingleEventSession(eventId, sessionId!);
  res.status(200).json({ message: 'Event session retrieved successfully', data });
});

const addEventSession = asyncHandler(async (req, res) => {
  const { eventId } = SessionParamsSchema.parse(req.params);
  const payload = AddingSessionSchema.parse(req.body);
  const data = await EventSessionsService.addEventSession(eventId, payload);
  await writeAudit(req, eventId, 'add');
  res.status(201).json({ message: 'Event session created successfully', data });
});

const updateEventSession = asyncHandler(async (req, res) => {
  const { eventId, sessionId } = SessionParamsSchema.parse(req.params);
  const payload = UpdatingSessionSchema.parse(req.body);
  const data = await EventSessionsService.updateEventSession(eventId, sessionId!, payload);
  await writeAudit(req, eventId, 'update', sessionId);
  res.status(200).json({ message: 'Event session updated successfully', data });
});

const toggleEventSessionStatus = asyncHandler(async (req, res) => {
  const { eventId, sessionId } = SessionParamsSchema.parse(req.params);
  const data = await EventSessionsService.toggleEventSessionStatus(eventId, sessionId!);
  await writeAudit(req, eventId, 'toggle_status', sessionId);
  res.status(200).json({ message: 'Event session status updated successfully', data });
});

const deleteEventSession = asyncHandler(async (req, res) => {
  const { eventId, sessionId } = SessionParamsSchema.parse(req.params);
  await EventSessionsService.deleteEventSession(eventId, sessionId!);
  await writeAudit(req, eventId, 'delete', sessionId);
  res.status(200).json({ message: 'Event session deleted successfully' });
});

export {
  addEventSession,
  deleteEventSession,
  getAllEventSessions,
  getSingleEventSession,
  toggleEventSessionStatus,
  updateEventSession,
};
