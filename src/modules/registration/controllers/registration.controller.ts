import { asyncHandler } from '@core/utils/asyncHandler';
import { createRegistrationSchema } from '../dto/create-registration.dto';
import { TicketRegistrationValidationService } from '@modules/ticket/services/ticket-registration-validation.service';
import { EventRegistrationValidationService } from '../services/event-registration-validation.service';
import ApiError from '@core/errors/api.error';
import { FreeRegistrationWorkflow } from '../workflows/free-registration.workflow';
import logger from '@config/logger';
import ParticipantValidation from '@modules/participant/validation/participant.validation';
import { string } from 'zod';
import { serializePublicEvent } from '@modules/events-public/helper/serialized-event.helper';
import { EventRepository } from '@modules/events/persistence/event.repository';

/**
 * Get registration form with default and dynamic fields
 */
export const getRegistrationForm = asyncHandler(async (req, res) => {
  const eventId = string({ message: 'Need a vaid EventId' }).parse(req.params.eventId);
  const event = await EventRepository.findByIdOrSlug(eventId);
  if (!event) throw new ApiError(404, 'Event not found', 'EVENT_NOT_FOUND', 'The requested event was not found');
  const eventValidation = await EventRegistrationValidationService.validateEventForRegistration(event);
  if (!eventValidation.valid) {
    throw new ApiError(400, eventValidation.message!, eventValidation.code!);
  }
  // Get registration form with fields
  const formData = await EventRegistrationValidationService.getEventRegistrationForm(event);
  res.status(200).json({
    success: true,
    message: 'Registration form retrieved successfully',
    event: serializePublicEvent(event),
    fields: formData,
  });
});

export const createRegistration = asyncHandler(async (req, res) => {
  const payload = createRegistrationSchema.parse(req.body);
  const event = await EventRepository.findByIdOrSlug(payload.eventId);
  if (!event) throw new ApiError(404, 'Event not found', 'EVENT_NOT_FOUND', 'The requested event was not found');
  const eventValidation = await EventRegistrationValidationService.validateEventForRegistration(event);
  if (!eventValidation.valid) {
    throw new ApiError(400, eventValidation.message!, eventValidation.code!);
  }

  // Determine if this is a paid registration
  const ticket = await TicketRegistrationValidationService.validate(
    payload.eventId,
    payload.ticketId,
    payload.participants.length,
  );
  if (!ticket.valid || !ticket.ticket || !ticket.ticket.eventId) throw new ApiError(400, ticket.message!, ticket.code!);

  const validateParticipants = await ParticipantValidation.validate(
    ticket.ticket.eventId,
    payload.participants.map((p) => p.email),
  );
  if (!validateParticipants.valid)
    throw new ApiError(400, validateParticipants.message!, validateParticipants.code!, {
      emails: validateParticipants.emails,
    });

  if (ticket.ticket.price > 0) {
    // Handle paid registration logic
    logger.info('Inplement Padid Ticket');
  } else {
    const response = await FreeRegistrationWorkflow.execute({
      ...payload,
      ticketId: ticket.ticket._id!,
      eventId: ticket.ticket.eventId,
    });
    return res.status(201).json({
      success: true,
      message: 'Registration created successfully',
      code: 'REGISTRATION_SUCCESS',
      data: response,
    });
  }
  res.status(201).json({
    success: true,
    message: 'Registration created successfully',
    data: payload,
  });
});
