import logger from '@config/logger';
import { RegistrationEvents } from '@core/events';
import appEventEmitter from '@core/events/emitter/app-event.emitter';
import { ObjectId } from '@helpers/zod';

appEventEmitter.onEvent<{ registration: ObjectId }>(
  RegistrationEvents.REGISTRATION_CONFIRMED,
  async ({ payload, traceId }) => {
    try {
      logger.info(
        `Received registration confirmed event for registration ${payload.registration.toString()}`,
        { traceId },
      );
    } catch (error) {
      logger.error(
        `Ticket asset generation failed for registration ${payload.registration.toString()}`,
        error,
      );
    }
  },
);
