import { EventTicket } from '@modules/events/types';

import { TicketErrorCode } from '../constants/ticket.constants';

import { TicketValidationResult } from '../interfaces/ticket-validation.interface';
import mongoose from 'mongoose';
import TicketRepository from '../repository/ticket.repository';

interface GetTicketResult extends TicketValidationResult {
  ticket?: EventTicket & {
    eventId: mongoose.Types.ObjectId;
  };
}

export class TicketService {
  static async getTicketById(
    ticketId: string,
    eventId: string,
  ): Promise<GetTicketResult> {
    const ticket = await TicketRepository.getTicketByIdOrType(
      eventId,
      ticketId,
    );
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
