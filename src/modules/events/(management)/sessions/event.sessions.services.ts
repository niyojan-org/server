import { OrganizationRole } from '@modules/events/views/event.role.view';
import { Session } from '@modules/events/core/event.types';
import {
  findEventOrThrow,
  resolveCollectionItemIndex,
  throwItemNotFound,
  updateEventCollection,
} from '../shared/event.management.repository';
import EventSessionsHelper from './event.sessions.helper';

const findSessionOrThrow = (eventId: string, sessions: Session[], sessionId: string) => {
  const index = resolveCollectionItemIndex(sessions, sessionId, 'title');
  if (index === -1 || !sessions[index]) {
    throwItemNotFound('session', sessionId, eventId);
  }
  return { index, session: sessions[index] as Session };
};

export default class EventSessionsService {
  static async getAllEventSessions(eventId: string, _role?: OrganizationRole) {
    void _role;
    const event = await findEventOrThrow(eventId);
    return event.sessions;
  }

  static async getPublicEventSessions(eventId: string) {
    const event = await findEventOrThrow(eventId);
    return event.sessions.filter((session) => session.isActive);
  }

  static async getSingleEventSession(eventId: string, sessionId: string, includeInactive = true) {
    const event = await findEventOrThrow(eventId);
    const { session } = findSessionOrThrow(eventId, event.sessions, sessionId);
    if (!includeInactive && !session.isActive) throwItemNotFound('session', sessionId, eventId);
    return session;
  }

  static async addEventSession(eventId: string, payload: Session) {
    const event = await findEventOrThrow(eventId);
    EventSessionsHelper.validateSession(event, payload, true);
    const updatedEvent = await updateEventCollection(eventId, 'sessions', [
      ...event.sessions,
      payload,
    ]);
    return updatedEvent?.sessions ?? [];
  }

  static async updateEventSession(eventId: string, sessionId: string, payload: Partial<Session>) {
    const event = await findEventOrThrow(eventId);
    const { index, session } = findSessionOrThrow(eventId, event.sessions, sessionId);
    const updatedSession = { ...session, ...payload } as Session;
    EventSessionsHelper.validateSession(event, updatedSession, false);
    const sessions = [...event.sessions];
    sessions[index] = updatedSession;
    const updatedEvent = await updateEventCollection(eventId, 'sessions', sessions);
    return updatedEvent?.sessions[index];
  }

  static async toggleEventSessionStatus(eventId: string, sessionId: string) {
    const event = await findEventOrThrow(eventId);
    const { index, session } = findSessionOrThrow(eventId, event.sessions, sessionId);
    const sessions = [...event.sessions];
    sessions[index] = { ...session, isActive: !session.isActive };
    await updateEventCollection(eventId, 'sessions', sessions);
    return sessions[index];
  }

  static async deleteEventSession(eventId: string, sessionId: string) {
    const event = await findEventOrThrow(eventId);
    const { session } = findSessionOrThrow(eventId, event.sessions, sessionId);
    await updateEventCollection(
      eventId,
      'sessions',
      event.sessions.filter((item) => item._id?.toString() !== session._id?.toString()),
    );
  }
}
