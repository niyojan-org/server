import { asyncHandler } from '@core/utils/asyncHandler';
import z from 'zod';
import EventSessionsService from './event.sessions.services';

const SessionParamsSchema = z.object({
  eventId: z.string().min(1, 'Invalid event ID'),
  sessionId: z.string().min(1, 'Invalid session ID').optional(),
});

const getPublicEventSessions = asyncHandler(async (req, res) => {
  const { eventId } = SessionParamsSchema.parse(req.params);
  const data = await EventSessionsService.getPublicEventSessions(eventId);
  res.status(200).json({ message: 'Public event sessions retrieved successfully', data });
});

const getPublicEventSession = asyncHandler(async (req, res) => {
  const { eventId, sessionId } = SessionParamsSchema.parse(req.params);
  const data = await EventSessionsService.getSingleEventSession(eventId, sessionId!, false);
  res.status(200).json({ message: 'Public event session retrieved successfully', data });
});

export { getPublicEventSession, getPublicEventSessions };
