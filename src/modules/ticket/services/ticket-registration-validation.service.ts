import { TicketValidationResult } from '../interfaces/ticket-validation.interface';
import TicketRuleService from './ticket-validation.service';
import { TicketService } from './ticket.service';

export class TicketRegistrationValidationService {
  static async validate(
    eventId: string,
    ticketId: string,
    participants: number,
  ): Promise<TicketValidationResult> {
    const ticketResult = await TicketService.getTicketById(ticketId, eventId);
    if (!ticketResult.valid || !ticketResult.ticket) {
      return ticketResult;
    }

    return TicketRuleService.validateTicketForRegistration(
      ticketResult.ticket,
      participants,
    );
  }
}
