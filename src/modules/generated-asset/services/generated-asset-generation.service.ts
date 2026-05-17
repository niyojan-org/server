import logger from '@config/logger';
import { Types } from 'mongoose';
import { DesignTemplateRepository } from '@modules/design-template/repository/design-template.repository';
import { EventRepository } from '@modules/events/persistence/event.repository';
import ParticipantRepository from '@modules/participant/repository/participant.repository';
import RegistrationRepository from '@modules/registration/repository/registration.repository';
import TicketRepository from '@modules/ticket/repository/ticket.repository';
import { RegistrationDocument } from '@modules/registration/models/registration.model';
import { ParticipantDocument } from '@modules/participant/models/participant.model';
import { EventDocument, Ticket } from '@modules/events/core/event.types';
import { DesignTemplateDocument } from '@modules/design-template/persistence/design-template.model';
import { TemplateBindingResolver } from '@modules/renderers/utils/template-binding.resolver';
import { CanvasRenderService } from '@modules/renderers/services/renderer.service';
import GeneratedAssetStorageService from './generated-asset-storage.service';

export class GeneratedAssetGenerationService {
  static async generateTicket(registrationId: Types.ObjectId, traceId?: string) {
    const registration = await RegistrationRepository.findById(registrationId);
    if (!registration)
      throw new Error(
        `Registration with ID ${registrationId.toString()} not found for asset generation`,
      );
    const ticket = await TicketRepository.getTicketByIdOrType(
      registration.eventId,
      registration.ticketId,
    );
    if (!ticket) {
      logger.info(
        `Skipping asset generation for registration ${registrationId.toString()} because ticket template is not configured`,
      );
      return;
    }
    const templateId = ticket.template || new Types.ObjectId('6a0a1943e48a283e2af85dee');
    const template = await DesignTemplateRepository.findById(templateId);
    if (!template) {
      logger.warn(
        `Template ${templateId.toString()} not found/applicable for registration ${registrationId.toString()}`,
      );
      return;
    }
    const participants = await ParticipantRepository.getParticipantsByRegistrationId(
      registration._id,
    );
    const event = await EventRepository.findById(registration.eventId);
    if (!event) return;
    for (const participant of participants) {
      await this.generateTicketForParticipant({
        traceId,
        registration,
        participant,
        event,
        ticket,
        template,
      });
    }
  }

  private static async generateTicketForParticipant(input: {
    traceId?: string;
    registration: RegistrationDocument;
    participant: ParticipantDocument;
    event: EventDocument;
    ticket: Ticket;
    template: DesignTemplateDocument;
  }) {
    try {
      // console.log('Participant:- ', input.participant);
      // console.log('Template:- ', input.template.config);
      // console.log('Event:- ', { title: input.event.title });
      // console.log('Registration:- ', input.registration);
      const resolvedPayload = TemplateBindingResolver.resolveElements(
        input.template.config.elements,
        {
          event: input.event,
          participant: input.participant,
          registration: input.registration,
          ticket: input.ticket,
        },
      );
      console.log('Resolved Path:- ', resolvedPayload);
      const buffer = await CanvasRenderService.renderTemplate(
        input.template.config,
        resolvedPayload,
      );
      await GeneratedAssetStorageService.localUpload(buffer, 'test-ticket', 'ticket');
    } catch (error) {
      // const message = error instanceof Error ? error.message : 'Unknown asset generation failure';
      // await GeneratedAssetRepository.markFailed(created._id!, message);
      logger.error(
        `Failed to generate asset for participant ${input.participant._id.toString()}`,
        error,
      );
    }
  }
}
export default GeneratedAssetGenerationService;
