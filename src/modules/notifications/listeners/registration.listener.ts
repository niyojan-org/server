import logger from '@config/logger';
import { RegistrationEvents } from '@core/events';
import appEventEmitter from '@core/events/emitter/app-event.emitter';
import { ObjectId } from '@helpers/zod';
import { sendEventEmail } from '@infra/mail';
import { EventRepository } from '@modules/events/persistence/event.repository';
import ParticipantRepository from '@modules/participant/repository/participant.repository';
import RegistrationRepository from '@modules/registration/repository/registration.repository';

appEventEmitter.onEvent<{
  registration: ObjectId;
  participants: Array<string>;
}>(RegistrationEvents.REGISTRATION_CONFIRMED, async ({ payload, traceId }) => {
  // const { participants } = payload;
  const registration = await RegistrationRepository.findById(payload.registration);
  if (!registration) {
    logger.error(
      `Registration with ID ${payload.registration} not found for sending confirmation email`,
      { traceId },
    );
    return;
  }
  const event = await EventRepository.findById(registration.eventId);
  const participentsDetails = await ParticipantRepository.getParticipantsByRegistrationId(
    registration._id,
  );
  for (const participant of participentsDetails) {
    const emailPayload = {
      name: participant.name,
      eventName: event?.title || 'Orgatick Event',
      eventDate: event?.sessions[0]?.startTime.toDateString() || '',
      eventTime: event?.sessions[0]?.startTime.toISOString() || '',
      eventLocation: 'TBD',
      eventUrl: `https://orgatick.com/events/${event?.slug}`,
      registrationId: registration._id.toString(),
    };
    await sendEventEmail.registrationConfirmed(participant.email, emailPayload);
  }
});
