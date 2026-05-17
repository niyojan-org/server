import { RegistrationStatus } from '../constants/registration.constants';
import { RegistrationPricingService } from '../services/registration-pricing.service';
import { CreateRegistrationDto } from '../dto/create-registration.dto';
import RegistrationRepository from '../repository/registration.repository';
import mongoose from 'mongoose';
import ParticipantRepository from '@modules/participant/repository/participant.repository';
import { CreateParticipantDto } from '@modules/participant/types/participant.types';
import ApiError from '@core/errors/api.error';
import { EventDispatcher } from '@core/events/utils/event-dispatcher';
import { RegistrationEvents } from '@core/events';

export class FreeRegistrationWorkflow {
  static async execute(payload: CreateRegistrationDto) {
    const session = await mongoose.startSession();
    try {
      await session.withTransaction(async () => {
        const pricing = RegistrationPricingService.calculateFreeRegistrationPricing();
        // create registration
        const registration = await RegistrationRepository.createRegistration(
          payload,
          pricing,
          session,
        );
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

        // link participants
        registration.participantIds = participants.map((participant) => participant._id);

        // confirm registration
        registration.status = RegistrationStatus.CONFIRMED;
        await registration.save({ session });
        // Emit event for notifications and other post-confirmation processes
        EventDispatcher.emit(RegistrationEvents.REGISTRATION_CONFIRMED, {
          registration: registration._id,
          participants: participants.map((p) => p._id),
        });
        return { registration, participants };
      });
    } catch {
      session.abortTransaction();
      throw new ApiError(
        500,
        'Failed to complete free registration workflow',
        'FREE_REGISTRATION_WORKFLOW_ERROR',
        'An error occurred while processing the free registration workflow. Please try again later.',
      );
    } finally {
      await session.endSession();
    }
  }
}
