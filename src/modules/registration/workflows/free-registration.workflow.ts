import { RegistrationStatus } from '../constants/registration.constants';
import { RegistrationPricingService } from '../services/registration-pricing.service';
import { CreateRegistrationDto } from '../dto/create-registration.dto';
import RegistrationRepository from '../repository/registration.repository';
import { SeatReservationService } from '../services/seat-reservation.service';
import mongoose from 'mongoose';
import ParticipantRepository from '@modules/participant/repository/participant.repository';
import { CreateParticipantDto } from '@modules/participant/types/participant.types';
import ApiError from '@core/errors/api.error';
import { EventDispatcher } from '@core/events/utils/event-dispatcher';
import { RegistrationEvents } from '@core/events';
import { RegistrationDocument } from '../models/registration.model';
import { ParticipantDocument } from '@modules/participant/models/participant.model';

export class FreeRegistrationWorkflow {
  static async execute(payload: CreateRegistrationDto) {
    const session = await mongoose.startSession();
    let reservationId: string | undefined;
    let registrationData:
      | {
          registration: RegistrationDocument;
          participants: ParticipantDocument[];
        }
      | undefined;
    try {
      await session.withTransaction(async () => {
        const reservation = await SeatReservationService.reserveSeats({
          eventId: payload.eventId,
          ticketId: payload.ticketId,
          quantity: payload.participants.length,
          expiresInMinutes: 10,
        });
        reservationId = reservation.reservationId;

        const pricing = RegistrationPricingService.calculateFreeRegistrationPricing();
        // Create registration
        const registration = await RegistrationRepository.createRegistration(payload, pricing, session);
        const rawParticipants: CreateParticipantDto[] = payload.participants.map((participant) => ({
          registrationId: registration._id,
          eventId: registration.eventId,
          ticketId: registration.ticketId,
          name: participant.name,
          email: participant.email,
          phone: participant.phone,
          dynamicFields: participant.dynamicFields,
        }));
        const participants = await ParticipantRepository.addParticipants(rawParticipants, session);

        // Link participants
        registration.participantIds = participants.map((participant) => participant._id);

        // Confirm registration
        registration.status = RegistrationStatus.CONFIRMED;
        await registration.save({ session });

        // OPTION 1: Atomically update ticket sold count
        // OPTION 2: Confirm the reservation
        await SeatReservationService.confirmSales(
          {
            eventId: payload.eventId,
            ticketId: payload.ticketId,
            quantity: payload.participants.length,
            reservationId,
          },
          session,
        );

        registrationData = { registration, participants };
      });
      if (registrationData) {
        EventDispatcher.emit(RegistrationEvents.REGISTRATION_CONFIRMED, {
          registration: registrationData.registration._id,
          participants: registrationData.participants.map((p) => p._id),
        });
      }

      return registrationData;
    } catch (error) {
      console.error('Free registration workflow error:', error);
      if (reservationId) {
        try {
          await SeatReservationService.releaseReservation(reservationId);
        } catch (e) {
          console.error('Failed to release reservation:', e);
        }
      }
      throw new ApiError(
        500,
        `Failed to complete free registration workflow`,
        'FREE_REGISTRATION_WORKFLOW_ERROR',
        'An error occurred while processing the free registration workflow. Please try again later.',
      );
    } finally {
      await session.endSession();
    }
  }
}
