import ApiError from '@core/errors/api.error';
import { EventDocument } from '@modules/events/core/event.types';
import { EventTicket } from '@modules/events/types';
import { OrganizationRole } from '@modules/events/views/event.role.view';
import { Organization } from '@modules/organization/types';

const TICKET_FIELD_RESTRICTIONS: Partial<
  Record<OrganizationRole, Array<keyof EventTicket>>
> = {
  owner: [], // Has access to everything
  admin: [],
  manager: ['sold'], // Managers cannot see sold count
  volunteer: ['sold'],
  member: ['sold'],
  // Add other roles and restricted fields as needed
};

// Default fallback restrictions for unknown, unmapped, or missing roles.
const DEFAULT_RESTRICTIONS: Array<keyof EventTicket> = ['sold'];

const filterTicketData = (
  role: OrganizationRole,
  ticket: EventTicket,
): Partial<EventTicket> => {
  const restrictedFields =
    TICKET_FIELD_RESTRICTIONS[role] ?? DEFAULT_RESTRICTIONS;
  const sanitizedTicket: Partial<EventTicket> = { ...ticket };
  for (const field of restrictedFields) {
    delete sanitizedTicket[field];
  }
  return sanitizedTicket;
};

const validateTicketLimits = (event: EventDocument, isNew: boolean, ticket: EventTicket) => {
  if (isNew && event.tickets.length >= 20) {
    throw new ApiError(
      400,
      'Cannot add more than 20 ticket types to an event',
      'TICKET_LIMIT_EXCEEDED',
      'The event already has the maximum number of ticket types allowed (20). Please remove an existing ticket type before adding a new one.',
    );
  }

  if (isNew) {
    const duplicateType = event.tickets.find(
      (t) => t.type.toUpperCase() === ticket.type.toUpperCase(),
    );
    if (duplicateType) {
      throw new ApiError(
        400,
        `A ticket with the type "${ticket.type}" already exists for this event`,
        'DUPLICATE_TICKET_TYPE',
        `Please choose a different name for the new ticket type.`,
      );
    }
  }
};

const validateTicketPricingAndCapacity = (ticket: EventTicket, organization: Organization) => {
  if (organization.allowsPaidEvents === false && ticket.price > 0) {
    throw new ApiError(
      400,
      'Organization does not allow paid events, so ticket price must be zero',
      'PAID_EVENTS_NOT_ALLOWED',
      'Please set the ticket price to zero or update the organization settings to allow paid events.',
    );
  }

  const MAX_PRICE = 10000 * 100; // Rs. 10,000 in smallest currency unit
  if (ticket.price > MAX_PRICE) {
    throw new ApiError(
      400,
      'Ticket price cannot exceed Rs. 10,000',
      'TICKET_PRICE_TOO_HIGH',
      'Please set a lower price for the ticket.',
    );
  }

  const MAX_CAPACITY = 10000;
  if (ticket.capacity > MAX_CAPACITY) {
    throw new ApiError(
      400,
      'Ticket capacity cannot exceed 10,000',
      'TICKET_CAPACITY_TOO_HIGH',
      'Please set a lower capacity for the ticket.',
    );
  }
};

const validateTicketDates = (event: EventDocument, ticket: EventTicket) => {
  const { salesStartTime, salesEndTime } = ticket;
  const { registrationStart, registrationEnd } = event;

  if (!salesStartTime || !salesEndTime) return;

  const salesStart = new Date(salesStartTime);
  const salesEnd = new Date(salesEndTime);
  const regStart = registrationStart ? new Date(registrationStart) : null;
  const regEnd = registrationEnd ? new Date(registrationEnd) : null;

  if (salesEnd <= salesStart) {
    throw new ApiError(
      400,
      'Ticket sales end time must be after sales start time',
      'INVALID_TICKET_SALES_END_TIME',
      'Please adjust the ticket sales end time accordingly.',
    );
  }

  if (regStart && salesStart < regStart) {
    throw new ApiError(
      400,
      'Ticket sales cannot start before the event registration opens',
      'INVALID_TICKET_SALES_START_TIME',
      'Please adjust the ticket sales start time to be after event registration opens.',
    );
  }

  if (regEnd && salesEnd > regEnd) {
    throw new ApiError(
      400,
      'Ticket sales cannot end after the event registration closes',
      'INVALID_TICKET_SALES_END_TIME',
      'Please adjust the ticket sales end time to be before event registration closes.',
    );
  }
};

const validateTicket = (
  event: EventDocument,
  ticket: EventTicket,
  isNew: boolean,
  organization: Organization,
) => {
  validateTicketLimits(event, isNew, ticket);
  validateTicketPricingAndCapacity(ticket, organization);
  validateTicketDates(event, ticket);
};

const EventsTicketsHelper = {
  filterTicketData,
  validateTicket,
};

export default EventsTicketsHelper;
