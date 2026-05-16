/* Seats remaining?
Sold out?
Capacity exceeded? */

import { EventTicket } from '@modules/events/types';

class TicketAvailabilityService {
  isTicketAvailable(ticket: EventTicket): boolean {
    if (ticket.capacity - ticket.sold <= 0) {
      return false;
    }
    return true;
  }
}

export default new TicketAvailabilityService();
