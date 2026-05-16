import { GroupSettings } from '@modules/events/core/event.types';
import { EventTicket } from '@modules/events/types';
import { TicketValidationResult } from '../interfaces/ticket-validation.interface';
import { TicketErrorCode } from '../constants/ticket.constants';

class TicketRuleService {
  static isSaleActive(ticket: EventTicket, now: Date = new Date()): boolean {
    return (
      ticket.isActive === true &&
      (!ticket.salesStartTime || ticket.salesStartTime <= now) &&
      (!ticket.salesEndTime || ticket.salesEndTime >= now)
    );
  }

  static validateGroupSize(
    groupSettings: GroupSettings,
    totalMembers: number,
  ): boolean {
    if (totalMembers < 1) {
      return false;
    }

    if (totalMembers < groupSettings.minParticipants) {
      return false;
    }

    if (totalMembers > groupSettings.maxParticipants) {
      return false;
    }

    return true;
  }

  static isTicketAvailable(capacity: number, sold: number): boolean {
    return (
      Number.isInteger(capacity) && Number.isInteger(sold) && sold < capacity
    );
  }

  static validateTicketForRegistration(
    ticket: EventTicket | null | undefined,
    participants: number = 1,
    now: Date = new Date(),
  ): TicketValidationResult {
    if (!ticket) {
      return {
        valid: false,
        code: TicketErrorCode.TICKET_NOT_FOUND,
        message: 'Ticket was not found.',
      };
    }

    if (participants < 1) {
      return {
        valid: false,
        code: TicketErrorCode.INVALID_PARTICIPANT_COUNT,
        message: 'Participant count must be at least 1.',
      };
    }

    if (!ticket.isActive) {
      return {
        valid: false,
        code: TicketErrorCode.TICKET_INACTIVE,
        message: 'Ticket is inactive.',
      };
    }

    if (ticket.salesStartTime && now < ticket.salesStartTime) {
      return {
        valid: false,
        code: TicketErrorCode.SALE_NOT_STARTED,
        message: 'Ticket sales have not started yet.',
      };
    }

    if (ticket.salesEndTime && now > ticket.salesEndTime) {
      return {
        valid: false,
        code: TicketErrorCode.SALE_ENDED,
        message: 'Ticket sales have ended.',
      };
    }

    if (ticket.capacity < 1) {
      return {
        valid: false,
        code: TicketErrorCode.INVALID_TICKET_CONFIGURATION,
        message: 'Ticket capacity is invalid.',
      };
    }

    if (ticket.sold < 0) {
      return {
        valid: false,
        code: TicketErrorCode.INVALID_TICKET_CONFIGURATION,
        message: 'Ticket sold count is invalid.',
      };
    }

    if (ticket.isGroupTicket) {
      if (!ticket.groupSettings) {
        return {
          valid: false,
          code: TicketErrorCode.INVALID_GROUP_SETTINGS,
          message: 'Group settings are required for group tickets.',
        };
      }

      const validGroupSize = this.validateGroupSize(
        ticket.groupSettings,
        participants,
      );

      if (!validGroupSize) {
        return {
          valid: false,
          code: TicketErrorCode.INVALID_GROUP_SIZE,
          message: 'Participant count is outside the allowed group size.',
        };
      }
    }

    if (!this.isTicketAvailable(ticket.capacity, ticket.sold)) {
      return {
        valid: false,
        code: TicketErrorCode.TICKET_SOLD_OUT,
        message: 'Ticket is sold out.',
      };
    }

    return { valid: true };
  }
}

export default TicketRuleService;
