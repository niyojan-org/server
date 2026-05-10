import { EventDocument } from '@modules/events/core/event.types';
import { EventTicket } from '@modules/events/types';
import { OrganizationRole } from '@modules/events/views/event.role.view';
import { Organization } from '@modules/organization/types';

export interface TicketValidationError {
  message: string;
  code: string;
  details: string;
}

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

const validateTicketLimits = (
  event: EventDocument,
  isNew: boolean,
  ticket: EventTicket,
  errors: TicketValidationError[],
) => {
  if (isNew && event.tickets.length >= 20) {
    errors.push({
      message: 'Cannot add more than 20 ticket types to an event',
      code: 'TICKET_LIMIT_EXCEEDED',
      details:
        'The event already has the maximum number of ticket types allowed (20). Please remove an existing ticket type before adding a new one.',
    });
  }

  if (isNew) {
    const duplicateType = event.tickets.find(
      (t) => t.type.toUpperCase() === ticket.type.toUpperCase(),
    );
    if (duplicateType) {
      errors.push({
        message: `A ticket with the type "${ticket.type}" already exists for this event`,
        code: 'DUPLICATE_TICKET_TYPE',
        details: `Please choose a different name for the new ticket type.`,
      });
    }
  }
};

const validateTicketPricingAndCapacity = (
  ticket: EventTicket,
  organization: Organization,
  errors: TicketValidationError[],
) => {
  if (organization.allowsPaidEvents === false && ticket.price > 0) {
    errors.push({
      message:
        'Organization does not allow paid events, so ticket price must be zero',
      code: 'PAID_EVENTS_NOT_ALLOWED',
      details:
        'Please set the ticket price to zero or update the organization settings to allow paid events.',
    });
    return;
  }

  const MAX_PRICE = 10000 * 100; // Rs. 10,000 in smallest currency unit
  if (ticket.price > MAX_PRICE) {
    errors.push({
      message: 'Ticket price cannot exceed Rs. 10,000',
      code: 'TICKET_PRICE_TOO_HIGH',
      details: 'Please set a lower price for the ticket.',
    });
  }

  const MAX_CAPACITY = 10000;
  if (ticket.capacity > MAX_CAPACITY) {
    errors.push({
      message: 'Ticket capacity cannot exceed 10,000',
      code: 'TICKET_CAPACITY_TOO_HIGH',
      details: 'Please set a lower capacity for the ticket.',
    });
  }
};

const validateTicketDates = (
  event: EventDocument,
  ticket: EventTicket,
  errors: TicketValidationError[],
) => {
  const { salesStartTime, salesEndTime } = ticket;
  const { registrationStart, registrationEnd } = event;

  if (!salesStartTime || !salesEndTime) return;

  const salesStart = new Date(salesStartTime);
  const salesEnd = new Date(salesEndTime);
  const regStart = registrationStart ? new Date(registrationStart) : null;
  const regEnd = registrationEnd ? new Date(registrationEnd) : null;

  if (salesEnd <= salesStart) {
    errors.push({
      message: 'Ticket sales end time must be after sales start time',
      code: 'INVALID_TICKET_SALES_END_TIME',
      details: 'Please adjust the ticket sales end time accordingly.',
    });
  }

  if (regStart && salesStart < regStart) {
    errors.push({
      message: 'Ticket sales cannot start before the event registration opens',
      code: 'INVALID_TICKET_SALES_START_TIME',
      details:
        'Please adjust the ticket sales start time to be after event registration opens.',
    });
  }

  if (regEnd && salesEnd > regEnd) {
    errors.push({
      message: 'Ticket sales cannot end after the event registration closes',
      code: 'INVALID_TICKET_SALES_END_TIME',
      details:
        'Please adjust the ticket sales end time to be before event registration closes.',
    });
  }
};

const validateTicket = (
  event: EventDocument,
  ticket: EventTicket,
  isNew: boolean,
  organization: Organization,
): TicketValidationError[] => {
  const errors: TicketValidationError[] = [];
  validateTicketLimits(event, isNew, ticket, errors);
  validateTicketPricingAndCapacity(ticket, organization, errors);
  validateTicketDates(event, ticket, errors);
  return errors;
};

export default {
  buildPublicTicket,
  filterTicketData,
  validateTicket,
};
