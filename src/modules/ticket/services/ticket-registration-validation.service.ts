import { EventTicket } from '@modules/events/types';
import { TicketValidationResult } from '../interfaces/ticket-validation.interface';
import TicketRuleService from './ticket-validation.service';
import { TicketService } from './ticket.service';
import { ObjectId } from '@helpers/zod';

interface TicketRegistrationValidationResult extends TicketValidationResult {
  ticket?: EventTicket & { eventId: ObjectId };
}
export class TicketRegistrationValidationService {
  static async validate(
    eventId: string,
    ticketId: string,
    participants: number,
  ): Promise<TicketRegistrationValidationResult> {
    const ticketResult = await TicketService.getTicketById(ticketId, eventId);
    if (!ticketResult.valid || !ticketResult.ticket) {
      return ticketResult;
    }
    if (ticketResult.valid) {
      const isRegistrationValid =
        TicketRuleService.validateTicketForRegistration(
          ticketResult.ticket,
          participants,
        );
      if (!isRegistrationValid.valid) {
        return {
          valid: false,
          code: isRegistrationValid.code,
          message: isRegistrationValid.message,
        };
      }
      return {
        valid: true,
        ticket: ticketResult.ticket,
      };
    }
    return {
      valid: false,
      code: ticketResult.code,
      message: ticketResult.message,
    };
  }
}
