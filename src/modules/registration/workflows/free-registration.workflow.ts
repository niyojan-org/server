import { RegistrationModel } from '../models/registration.model';

import { ParticipantModel } from '@modules/participant/models/participant.model';

import { RegistrationStatus } from '../constants/registration.constants';

import { RegistrationPricingService } from '../services/registration-pricing.service';

import { TicketRegistrationValidationService } from '@modules/ticket/services/ticket-registration-validation.service';

import { CreateRegistrationDto } from '../dto/create-registration.dto';

export class FreeRegistrationWorkflow {
  static async execute(payload: CreateRegistrationDto) {
    const participantsCount = payload.participants.length;
    const ticketValidation = await TicketRegistrationValidationService.validate(
      payload.eventId,
      payload.ticketId,
      participantsCount,
    );
    if (!ticketValidation.valid) {
      return ticketValidation;
    }
    // pricing
    const pricing =
      RegistrationPricingService.calculateFreeRegistrationPricing();

    // create registration
    const registration = await RegistrationModel.create({
      eventId: payload.eventId,
      ticketId: payload.ticketId,
      participantsCount,
      status: RegistrationStatus.DRAFT,
      pricing,
      groupInfo: payload.groupInfo
        ? {
            groupName: payload.groupInfo.groupName,
            totalMembers: participantsCount,
          }
        : undefined,
    });
    const participants = await ParticipantModel.insertMany(
      payload.participants.map((participant) => ({
        registrationId: registration._id,
        eventId: payload.eventId,
        ticketId: payload.ticketId,
        name: participant.name,
        email: participant.email,
        phone: participant.phone,
        dynamicFields: participant.dynamicFields || {},
      })),
    );

    // link participants
    registration.participantIds = participants.map(
      (participant) => participant._id,
    );

    //  confirm registration
    registration.status = RegistrationStatus.CONFIRMED;
    await registration.save();
    return {
      valid: true,
      registration,
      participants,
    };
  }
}
