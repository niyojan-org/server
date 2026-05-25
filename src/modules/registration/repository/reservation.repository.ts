import mongoose, { ClientSession } from 'mongoose';
import { ReservationDocument, ReservationModel } from '../models/persistence/reservation.model';
import { Types } from 'mongoose';

interface CreateReservationInput {
  eventId: mongoose.Types.ObjectId;
  ticketId: mongoose.Types.ObjectId;
  quantity: number;
  registrationId?: mongoose.Types.ObjectId;
  sessionId?: string;
  userId?: mongoose.Types.ObjectId;
  expiresIn?: number; // minutes, default 10
}

class ReservationRepository {
  /**
   * Create a reservation (locks seats temporarily)
   */
  static async createReservation(
    input: CreateReservationInput,
    session?: ClientSession,
  ): Promise<ReservationDocument> {
    const expirationMinutes = input.expiresIn || 10;
    const expiresAt = new Date(Date.now() + expirationMinutes * 60 * 1000);

    const reservation = new ReservationModel({
      eventId: input.eventId,
      ticketId: input.ticketId,
      quantity: input.quantity,
      registrationId: input.registrationId,
      sessionId: input.sessionId,
      userId: input.userId,
      status: 'active',
      expiresAt,
    });

    return reservation.save({ session });
  }

  /**
   * Get active reservations for a ticket
   */
  static async getActiveReservationsForTicket(
    ticketId: string | mongoose.Types.ObjectId,
  ): Promise<ReservationDocument[]> {
    return ReservationModel.find({
      ticketId: new Types.ObjectId(ticketId.toString()),
      status: 'active',
      expiresAt: { $gt: new Date() },
    });
  }

  /**
   * Get total reserved quantity for a ticket
   */
  static async getTotalReservedQuantity(
    ticketId: string | mongoose.Types.ObjectId,
  ): Promise<number> {
    const result = await ReservationModel.aggregate([
      {
        $match: {
          ticketId: new Types.ObjectId(ticketId.toString()),
          status: 'active',
          expiresAt: { $gt: new Date() },
        },
      },
      {
        $group: {
          _id: null,
          totalReserved: { $sum: '$quantity' },
        },
      },
    ]);

    return result.length > 0 ? result[0].totalReserved : 0;
  }

  /**
   * Confirm a reservation (mark as confirmed)
   */
  static async confirmReservation(
    reservationId: string | mongoose.Types.ObjectId,
    session?: ClientSession,
  ): Promise<ReservationDocument | null> {
    return ReservationModel.findByIdAndUpdate(
      new Types.ObjectId(reservationId.toString()),
      { status: 'confirmed' },
      { new: true, session },
    );
  }

  /**
   * Cancel a reservation
   */
  static async cancelReservation(
    reservationId: string | mongoose.Types.ObjectId,
    session?: ClientSession,
  ): Promise<ReservationDocument | null> {
    return ReservationModel.findByIdAndUpdate(
      new Types.ObjectId(reservationId.toString()),
      { status: 'cancelled' },
      { new: true, session },
    );
  }

  /**
   * Get reservation by ID
   */
  static async findById(
    reservationId: string | mongoose.Types.ObjectId,
  ): Promise<ReservationDocument | null> {
    return ReservationModel.findById(reservationId);
  }

  /**
   * Get reservation by registration ID
   */
  static async findByRegistrationId(
    registrationId: string | mongoose.Types.ObjectId,
  ): Promise<ReservationDocument | null> {
    return ReservationModel.findOne({
      registrationId: new Types.ObjectId(registrationId.toString()),
    });
  }

  /**
   * Clean up expired reservations (can be run as cron job)
   */
  static async cleanupExpiredReservations(): Promise<number> {
    const result = await ReservationModel.deleteMany({
      status: 'active',
      expiresAt: { $lt: new Date() },
    });
    return result.deletedCount || 0;
  }
}

export default ReservationRepository;
