import { asyncHandler } from '@core/utils/asyncHandler';
import { createRegistrationSchema } from '../dto/create-registration.dto';
import { TicketRegistrationValidationService } from '@modules/ticket/services/ticket-registration-validation.service';
import ApiError from '@core/errors/api.error';
import { FreeRegistrationWorkflow } from '../workflows/free-registration.workflow';
import logger from '@config/logger';
import ParticipantValidation from '@modules/participant/validation/participant.validation';

export const createRegistration = asyncHandler(async (req, res) => {
  const payload = createRegistrationSchema.parse(req.body);

  // Determine if this is a paid registration
  const ticket = await TicketRegistrationValidationService.validate(
    payload.eventId,
    payload.ticketId,
    payload.participants.length,
  );
  if (!ticket.valid || !ticket.ticket || !ticket.ticket.eventId)
    throw new ApiError(400, ticket.message!, ticket.code!);
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
    await FreeRegistrationWorkflow.execute({
      ...payload,
      ticketId: ticket.ticket._id!,
      eventId: ticket.ticket.eventId,
    });
    return res.status(201).json({
      success: true,
      message: 'Registration created successfully',
    });
  }
  res.status(201).json({
    success: true,
    message: 'Registration created successfully',
    data: payload,
  });
});
