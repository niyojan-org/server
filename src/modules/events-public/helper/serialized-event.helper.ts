import {
  EventDocument,
  Session,
  Ticket,
} from '@modules/events/core/event.types';
import {
  PublicEventPayload,
  PublicEventSession,
  PublicEventTicket,
} from '../types/serialized-event.type';

const toSession = (session: Session): PublicEventSession | null => {
  return {
    id: typeof session._id === 'string' ? session._id : undefined,
    title: typeof session.title === 'string' ? session.title : undefined,
    description:
      typeof session.description === 'string' ? session.description : undefined,
    startTime: session.startTime as Date | string | undefined,
    endTime: session.endTime as Date | string | undefined,
    venue: session.venue,
    isActive: session.isActive,
    allowCheckIn: session.allowCheckIn,
    checkInStartTime: session.checkInStartTime as Date | string | undefined,
    checkInEndTime: session.checkInEndTime as Date | string | undefined,
    speakers: session.speakers,
  };
};

const toTicket = (ticket: Ticket): PublicEventTicket | null => {
  if (!ticket) return null;
  return {
    id: ticket._id?.toString(),
    type: ticket.type,
    price: ticket.price,
    capacity: ticket.capacity,
    salesStartTime: ticket.salesStartTime,
    salesEndTime: ticket.salesEndTime,
    isActive: ticket.isActive,
    isGroupTicket: ticket.isGroupTicket,
    groupSettings: ticket.groupSettings,
  };
};

export const serializePublicEvent = (
  event: EventDocument,
): PublicEventPayload => {
  const sessions = Array.isArray(event.sessions)
    ? event.sessions.map(toSession).filter(Boolean)
    : undefined;
  const tickets = Array.isArray(event.tickets)
    ? event.tickets.map(toTicket).filter(Boolean)
    : undefined;

  return {
    id: event._id?.toString(),
    title: event.title,
    description: event.description,
    bannerImage: event.bannerImage,
    banner: event.banner,
    tags: event.tags,
    category: event.category,
    mode: event.mode,
    visibility: event.visibility,
    registrationStart: event.registrationStart,
    registrationEnd: event.registrationEnd,
    allowMultipleSessions: event.allowMultipleSessions,
    allowCoupons: event.allowCoupons,
    allowReferrals: event.allowReferrals,
    slug: event.slug,
    status: event.status,
    isRegistrationOpen: event.isRegistrationOpen,
    publishedAt: event.publishedAt,
    sessions: sessions as PublicEventSession[],
    tickets: tickets as PublicEventTicket[],
  };
};

export const serializePublicEvents = (
  events: EventDocument[],
): PublicEventPayload[] => events.map(serializePublicEvent);
