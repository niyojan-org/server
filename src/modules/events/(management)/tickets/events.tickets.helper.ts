import ApiError from '@core/errors/api.error';
import { EventDocument } from '@modules/events/core/event.types';
import { EventTicket } from '@modules/events/types';
import { OrganizationRole } from '@modules/events/views/event.role.view';
import { Organization } from '@modules/organization/types';

const MAX_PRICE_IN_PAISA = 10000 * 100;
const MAX_CAPACITY = 10000;

const TICKET_FIELD_RESTRICTIONS: Partial<
  Record<OrganizationRole, Array<keyof EventTicket>>
> = {
  manager: ['sold'],
  volunteer: ['sold'],
  member: ['sold'],
};

const DEFAULT_RESTRICTIONS: Array<keyof EventTicket> = ['sold'];

const buildPublicTicket = (ticket: EventTicket) => ({
  ...ticket,
  remaining: Math.max(0, ticket.capacity - ticket.sold),
  isSoldOut: ticket.sold >= ticket.capacity,
  pricePaisa: ticket.price,
});

const filterTicketData = (role: OrganizationRole, ticket: EventTicket) => {
  const restrictedFields =
    TICKET_FIELD_RESTRICTIONS[role] ?? DEFAULT_RESTRICTIONS;
  const sanitizedTicket: Partial<EventTicket> = { ...ticket };
  for (const field of restrictedFields) delete sanitizedTicket[field];
  return sanitizedTicket;
};

const validateTicket = (
  event: EventDocument,
  ticket: EventTicket,
  isNew: boolean,
  organization: Organization,
) => {
  if (isNew && event.tickets.length >= 20) {
    throw new ApiError(
      400,
      'Cannot add more than 20 ticket types to an event',
      'TICKET_LIMIT_EXCEEDED',
      'Remove an existing ticket before adding a new one.',
    );
  }

  const duplicateType = event.tickets.find(
    (existing) =>
      existing.type.toUpperCase() === ticket.type.toUpperCase() &&
      existing._id?.toString() !== ticket._id?.toString(),
  );
  if (duplicateType) {
    throw new ApiError(
      400,
      `A ticket with the type "${ticket.type}" already exists for this event`,
      'DUPLICATE_TICKET_TYPE',
      'Each ticket type must be unique within an event.',
    );
  }

  if (!organization.allowsPaidEvents && ticket.price > 0) {
    throw new ApiError(
      400,
      'This organization cannot create paid tickets',
      'PAID_EVENTS_NOT_ALLOWED',
      'Set the ticket price to 0 or enable paid events for the organization.',
    );
  }
  if (ticket.price > MAX_PRICE_IN_PAISA) {
    throw new ApiError(
      400,
      'Ticket price cannot exceed Rs. 10,000',
      'TICKET_PRICE_TOO_HIGH',
      'Send the amount in paisa, with a maximum of 1000000.',
    );
  }
  if (ticket.capacity > MAX_CAPACITY) {
    throw new ApiError(
      400,
      'Ticket capacity cannot exceed 10,000',
      'TICKET_CAPACITY_TOO_HIGH',
      'Lower the ticket capacity before saving.',
    );
  }
  if (ticket.salesStartTime < event.registrationStart) {
    throw new ApiError(
      400,
      'Ticket sales cannot start before registration opens',
      'INVALID_TICKET_SALES_WINDOW',
      'Move the ticket sales start time inside the registration window.',
    );
  }
  if (ticket.salesEndTime > event.registrationEnd) {
    throw new ApiError(
      400,
      'Ticket sales cannot end after registration closes',
      'INVALID_TICKET_SALES_WINDOW',
      'Move the ticket sales end time inside the registration window.',
    );
  }
};

export default {
  buildPublicTicket,
  filterTicketData,
  validateTicket,
};
