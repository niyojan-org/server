import ApiError from '@core/errors/api.error';
import { CreateEventInput, Session, Ticket, Coupon } from './event.types';
import { Organization } from '@modules/organization/types';

const ensure = (
  condition: boolean,
  message: string,
  code: string,
  details: string,
) => {
  if (!condition) {
    throw new ApiError(400, message, code, details);
  }
};

const ensureUniqueSessionTitles = (sessions: Session[]) => {
  const seen = new Set<string>();
  for (const session of sessions) {
    const key = session.title.trim().toLowerCase();
    ensure(
      !seen.has(key),
      `Duplicate session title "${session.title}" found`,
      'DUPLICATE_SESSION_TITLE',
      'Each session title must be unique within the event.',
    );
    seen.add(key);
  }
};

const ensureTicketRules = (
  tickets: Ticket[],
  registrationStart: Date,
  registrationEnd: Date,
  organization: Organization,
) => {
  for (const ticket of tickets) {
    ensure(
      ticket.sold === 0,
      `Ticket ${ticket.type} cannot be created with sold count`,
      'INVALID_TICKET_SOLD_COUNT',
      'New events must start with sold count set to 0 for every ticket.',
    );
    ensure(
      organization.allowsPaidEvents || ticket.price === 0,
      'This organization cannot create paid tickets',
      'PAID_EVENTS_NOT_ALLOWED',
      'Set ticket prices to 0 or enable paid events for the organization.',
    );
    ensure(
      ticket.salesStartTime >= registrationStart,
      `Ticket ${ticket.type} sales cannot start before registration starts`,
      'INVALID_TICKET_SALES_WINDOW',
      'Move the ticket sales start time inside the event registration window.',
    );
    ensure(
      ticket.salesEndTime <= registrationEnd,
      `Ticket ${ticket.type} sales cannot end after registration closes`,
      'INVALID_TICKET_SALES_WINDOW',
      'Move the ticket sales end time inside the event registration window.',
    );
  }
};

const ensureCouponRules = (coupons: Coupon[], tickets: Ticket[]) => {
  const ticketIds = new Set(
    tickets
      .map((ticket) => ticket._id?.toString())
      .filter((value): value is string => Boolean(value)),
  );

  for (const coupon of coupons) {
    if (!coupon.validTicketTypes?.length) continue;
    ensure(
      coupon.validTicketTypes.every((ticketId) =>
        ticketIds.has(ticketId.toString()),
      ),
      `Coupon ${coupon.code} references unknown ticket ids`,
      'INVALID_COUPON_TICKETS',
      'Create tickets first, then reference their ids while creating coupons.',
    );
  }
};

export const validateEventCreation = (
  event: CreateEventInput,
  organization: Organization,
) => {
  ensure(
    organization.allowsEventCreation,
    'This organization cannot create events right now',
    'EVENT_CREATION_DISABLED',
    'Ask a taskmaster or system admin to re-enable event creation.',
  );
  ensure(
    !organization.isBlocked,
    'Blocked organizations cannot create events',
    'ORGANIZATION_BLOCKED',
    'Resolve the organization block before creating a new event.',
  );

  ensureUniqueSessionTitles(event.sessions);
  ensureTicketRules(
    event.tickets,
    event.registrationStart,
    event.registrationEnd,
    organization,
  );
  ensureCouponRules(event.coupons, event.tickets);
};
