import logger from '@config/logger';
import { RegistrationEvents } from '@core/events';
import appEventEmitter from '@core/events/emitter/app-event.emitter';
import { ObjectId } from '@helpers/zod';
import RegistrationRepository from '@modules/registration/repository/registration.repository';
import GeneratedAssetGenerationService from '../services/generated-asset-generation.service';
import GeneratedAssetStorageService from '../services/generated-asset-storage.service';
import ParticipantRepository from '@modules/participant/repository/participant.repository';

appEventEmitter.onEvent<{ registration: ObjectId }>(
  RegistrationEvents.REGISTRATION_CONFIRMED,
  async ({ payload, traceId }) => {
    try {
      const registration = await RegistrationRepository.findById(payload.registration);
      if (!registration) return;
      // trigger ticket asset generation
      const participants = await ParticipantRepository.getParticipantsByRegistrationId(
        registration._id,
      );
      for (const participant of participants) {
        const ticketBuffer = await GeneratedAssetGenerationService.generateTicket(
          registration._id,
          participant._id,
          traceId,
        );
        if (!ticketBuffer) return;
        await GeneratedAssetStorageService.localUpload(
          ticketBuffer,
          `participant_${participant._id.toString()}`,
          'tickets',
        );
      }
    } catch (error) {
      logger.error(
        `Ticket asset generation failed for registration ${payload.registration.toString()}`,
        error,
      );
    }
  },
);
