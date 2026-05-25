import { Types } from 'mongoose';
import redis from '@config/redis';

export interface ReservationData {
  eventId: string;
  ticketId: string;
  quantity: number;
  registrationId?: string;
  userId?: string;
  status: 'active' | 'confirmed' | 'cancelled';
  createdAt: number;
}

export class ReservationRedisRepository {
  private static readonly PREFIX = 'reservation:';
  private static readonly INDEX_PREFIX = 'ticket-reservations:';

  /**
   * Create a new reservation in Redis with TTL
   */
  static async createReservation(input: {
    eventId: Types.ObjectId;
    ticketId: Types.ObjectId;
    quantity: number;
    registrationId?: Types.ObjectId;
    userId?: Types.ObjectId;
    expiresInMinutes?: number;
  }): Promise<{ reservationId: string; expiresAt: number }> {
    const reservationId = new Types.ObjectId().toString();
    const expiresInSeconds = (input.expiresInMinutes || 10) * 60;
    const now = Date.now();
    const expiresAt = now + expiresInSeconds * 1000;

    const reservationData: ReservationData = {
      eventId: input.eventId.toString(),
      ticketId: input.ticketId.toString(),
      quantity: input.quantity,
      registrationId: input.registrationId?.toString(),
      userId: input.userId?.toString(),
      status: 'active',
      createdAt: now,
    };

    // Store reservation with TTL
    const key = `${this.PREFIX}${reservationId}`;
    await redis.setex(key, expiresInSeconds, JSON.stringify(reservationData));

    // Add to ticket index for quick lookup of total reserved quantity
    const indexKey = `${this.INDEX_PREFIX}${input.ticketId.toString()}`;
    await redis.sadd(indexKey, reservationId);
    await redis.expire(indexKey, expiresInSeconds);

    return { reservationId, expiresAt };
  }

  static async findById(reservationId: string): Promise<ReservationData | null> {
    const key = `${this.PREFIX}${reservationId}`;
    const data = await redis.get(key);
    if (!data) return null;
    return JSON.parse(data);
  }

  /**
   * Confirm a reservation (mark as confirmed, keep until full expiration)
   */
  static async confirmReservation(reservationId: string): Promise<boolean> {
    const key = `${this.PREFIX}${reservationId}`;
    const data = await redis.get(key);
    if (!data) return false;

    const reservation: ReservationData = JSON.parse(data);
    reservation.status = 'confirmed';

    const ttl = await redis.ttl(key);
    if (ttl > 0) {
      await redis.setex(key, ttl, JSON.stringify(reservation));
      return true;
    }
    return false;
  }

  /**
   * Cancel a reservation (mark as cancelled, remove from index)
   */
  static async cancelReservation(reservationId: string): Promise<boolean> {
    const key = `${this.PREFIX}${reservationId}`;
    const data = await redis.get(key);
    if (!data) return false;

    const reservation: ReservationData = JSON.parse(data);
    reservation.status = 'cancelled';

    const ttl = await redis.ttl(key);
    if (ttl > 0) {
      await redis.setex(key, ttl, JSON.stringify(reservation));
      return true;
    }
    return false;
  }

  /**
   * Get total reserved quantity for a ticket (excluding cancelled)
   */
  static async getTotalReservedQuantity(ticketId: Types.ObjectId): Promise<number> {
    const indexKey = `${this.INDEX_PREFIX}${ticketId.toString()}`;
    const reservationIds = await redis.smembers(indexKey);

    if (reservationIds.length === 0) return 0;

    let total = 0;
    for (const reservationId of reservationIds) {
      const reservation = await this.findById(reservationId);
      if (reservation && reservation.status === 'active') {
        total += reservation.quantity;
      }
    }

    return total;
  }

  /**
   * Get all active reservations for a ticket
   */
  static async getActiveReservationsForTicket(ticketId: Types.ObjectId): Promise<ReservationData[]> {
    const indexKey = `${this.INDEX_PREFIX}${ticketId.toString()}`;
    const reservationIds = await redis.smembers(indexKey);

    const reservations: ReservationData[] = [];
    for (const reservationId of reservationIds) {
      const reservation = await this.findById(reservationId);
      if (reservation && reservation.status === 'active') {
        reservations.push(reservation);
      }
    }

    return reservations;
  }

  /**
   * Delete a reservation (cleanup)
   */
  static async delete(reservationId: string): Promise<boolean> {
    const key = `${this.PREFIX}${reservationId}`;
    const result = await redis.del(key);
    return result > 0;
  }
}
