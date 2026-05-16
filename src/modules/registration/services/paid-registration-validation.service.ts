import { EventTicket } from '@modules/events/types';
import { TicketValidationResult } from '@modules/ticket/interfaces/ticket-validation.interface';
import { TicketErrorCode } from '@modules/ticket/constants/ticket.constants';

export class PaidRegistrationValidationService {
  /**
   * Validate that a ticket is eligible for paid registration
   * @param ticket The EventTicket to validate
   * @returns Validation result
   */
  static validateTicketForPaidRegistration(
    ticket: EventTicket | null | undefined,
  ): TicketValidationResult {
    if (!ticket) {
      return {
        valid: false,
        code: TicketErrorCode.TICKET_NOT_FOUND,
        message: 'Ticket was not found.',
      };
    }

    // Ensure ticket has a valid price for paid registration
    if (ticket.price === null || ticket.price === undefined) {
      return {
        valid: false,
        code: TicketErrorCode.INVALID_TICKET_CONFIGURATION,
        message: 'Ticket price is not configured.',
      };
    }

    if (ticket.price <= 0) {
      return {
        valid: false,
        code: TicketErrorCode.INVALID_TICKET_CONFIGURATION,
        message: 'Ticket price must be greater than zero for paid registrations.',
      };
    }

    return { valid: true };
  }

  /**
   * Validate that multiple conditions are met for paid registration
   * This is called after ticket registration validation
   * @param ticket The EventTicket
   * @param ticketRegistrationValidationResult Result from TicketRegistrationValidationService
   * @returns Combined validation result
   */
  static validatePaidRegistrationPreconditions(
    ticket: EventTicket | null | undefined,
    ticketRegistrationValidationResult: TicketValidationResult,
  ): TicketValidationResult {
    // First check general registration validity
    if (!ticketRegistrationValidationResult.valid) {
      return ticketRegistrationValidationResult;
    }

    // Then check paid-specific requirements
    return this.validateTicketForPaidRegistration(ticket);
  }
}
