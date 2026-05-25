import { ClientSession } from 'mongoose';
import { Types } from 'mongoose';
import { ReservationData, ReservationRedisRepository } from '../repository/reservation-redis.repository';
import { EventRepository } from '@modules/events/persistence/event.repository';
import ApiError from '@core/errors/api.error';

interface ReserveSeatsInput {
  eventId: Types.ObjectId;
  ticketId: Types.ObjectId;
  quantity: number;
  registrationId?: Types.ObjectId;
  userId?: Types.ObjectId;
  expiresInMinutes?: number;
}

interface ConfirmSalesInput {
  eventId: Types.ObjectId;
  ticketId: Types.ObjectId;
  quantity: number;
  reservationId: string;
}

export class SeatReservationService {
  /**
   * OPTION 2: Reserve seats for a registration
   * Creates temporary lock on seats with 10-minute expiration in Redis
   */
  static async reserveSeats(input: ReserveSeatsInput): Promise<{ reservationId: string; expiresAt: number }> {
    // Create reservation to lock seats
    const reservation = await ReservationRedisRepository.createReservation({
      eventId: input.eventId,
      ticketId: input.ticketId,
      quantity: input.quantity,
      registrationId: input.registrationId,
      userId: input.userId,
      expiresInMinutes: input.expiresInMinutes || 10,
    });

    return {
      reservationId: reservation.reservationId,
      expiresAt: reservation.expiresAt,
    };
  }

  /**
   * Confirm seats were sold (converts reservation to permanent sold count)
   * This should only be called AFTER successful registration confirmation
   */
  static async confirmSales(input: ConfirmSalesInput, session?: ClientSession): Promise<boolean> {
    // Atomically increment ticket sold count
    const result = await EventRepository.atomicIncrementTicketSold(
      input.eventId,
      input.ticketId,
      input.quantity,
      session,
    );

    if (!result.success) {
      throw new ApiError(
        409,
        result.error || 'Failed to confirm ticket sales',
        'TICKET_SALES_CONFIRMATION_FAILED',
        'Ticket capacity exceeded - another registration just completed',
      );
    }

    // Mark reservation as confirmed in Redis
    await ReservationRedisRepository.confirmReservation(input.reservationId);

    return true;
  }

  /**
   * Release a reservation (cancel it, unlock seats)
   */
  static async releaseReservation(reservationId: string): Promise<boolean> {
    const reservation = await ReservationRedisRepository.findById(reservationId);
    if (!reservation) return false;

    await ReservationRedisRepository.cancelReservation(reservationId);
    return true;
  }

  /**
   * Rollback a confirmed sale (for refunds/cancellations)
   */
  static async rollbackSale(
    eventId: Types.ObjectId,
    ticketId: Types.ObjectId,
    quantity: number,
    session?: ClientSession,
  ): Promise<boolean> {
    return EventRepository.decrementTicketSold(eventId, ticketId, quantity, session);
  }

  // Get reservation details
  static async getReservationDetails(reservationId: string): Promise<ReservationData | null> {
    return ReservationRedisRepository.findById(reservationId);
  }

  // Get total reserved quantity for a ticket
  static async getTotalReservedQuantity(ticketId: Types.ObjectId): Promise<number> {
    return ReservationRedisRepository.getTotalReservedQuantity(ticketId);
  }
}
