import { Types } from 'mongoose';
import { EventRepository } from '@modules/events/persistence/event.repository';
import ReservationRepository from '../repository/reservation.repository';
import ApiError from '@core/errors/api.error';

interface AvailabilityCheckResult {
  available: boolean;
  availableSeats: number;
  message?: string;
}

export class TicketAvailabilityCheckService {
  /**
   * Check if a ticket has sufficient available capacity
   * Considers both sold count and active reservations
   */
  static async checkAvailability(
    eventId: Types.ObjectId,
    ticketId: Types.ObjectId,
    requiredQuantity: number,
  ): Promise<AvailabilityCheckResult> {
    // Get ticket details
    const ticket = await EventRepository.getTicketById(eventId, ticketId);

    if (!ticket) {
      throw new ApiError(
        404,
        'Ticket not found',
        'TICKET_NOT_FOUND',
        'The requested ticket does not exist',
      );
    }

    if (!ticket.isActive) {
      throw new ApiError(
        400,
        'Ticket is no longer available',
        'TICKET_INACTIVE',
        'This ticket has been disabled',
      );
    }

    // Check sales time window
    const now = new Date();
    if (ticket.salesStartTime && now < ticket.salesStartTime) {
      throw new ApiError(
        400,
        'Ticket sales have not started yet',
        'TICKET_SALES_NOT_STARTED',
        `Sales will begin on ${ticket.salesStartTime.toISOString()}`,
      );
    }

    if (ticket.salesEndTime && now > ticket.salesEndTime) {
      throw new ApiError(
        400,
        'Ticket sales have ended',
        'TICKET_SALES_ENDED',
        `Sales ended on ${ticket.salesEndTime.toISOString()}`,
      );
    }

    // Calculate available seats
    const sold = ticket.sold || 0;
    const reserved = await ReservationRepository.getTotalReservedQuantity(ticketId);
    const available = Math.max(0, ticket.capacity - sold - reserved);

    if (available < requiredQuantity) {
      return {
        available: false,
        availableSeats: available,
        message: `Only ${available} seats available (need ${requiredQuantity})`,
      };
    }

    return {
      available: true,
      availableSeats: available,
    };
  }

  /**
   * Get remaining available seats for a ticket
   */
  static async getAvailableSeats(
    eventId: Types.ObjectId,
    ticketId: Types.ObjectId,
  ): Promise<number> {
    const ticket = await EventRepository.getTicketById(eventId, ticketId);

    if (!ticket) {
      return 0;
    }

    const sold = ticket.sold || 0;
    const reserved = await ReservationRepository.getTotalReservedQuantity(ticketId);
    return Math.max(0, ticket.capacity - sold - reserved);
  }
}
