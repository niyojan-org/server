import { EventTicket } from '@modules/events/types';

import { TicketErrorCode } from '../constants/ticket.constants';

import { TicketValidationResult } from '../interfaces/ticket-validation.interface';
import { EventRepository } from '@modules/events/persistence/event.repository';

interface GetTicketResult extends TicketValidationResult {
  ticket?: EventTicket;
}

export class TicketService {
  static async getTicketById(
    ticketId: string,
    eventId: string,
  ): Promise<GetTicketResult> {
    const ticket = await EventRepository.getTicketByIdOrType(eventId, ticketId);
    if (!ticket) {
      return {
        valid: false,
        code: TicketErrorCode.TICKET_NOT_FOUND,
        message: 'Ticket not found',
      };
    }
    return {
      valid: true,
      ticket,
    };
  }
}
