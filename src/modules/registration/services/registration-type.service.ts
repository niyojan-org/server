import { EventTicket } from '@modules/events/types';
import {
  RegistrationType,
  RegistrationTypeHelpers,
} from '../constants/registration.constants';

export interface DetermineRegistrationTypeInput {
  ticket: EventTicket;
  participantsCount: number;
}

export class RegistrationTypeService {
  /**
   * Determine the registration type based on ticket and participant count
   * @param input Ticket and participants count
   * @returns The determined RegistrationType
   */
  static determineRegistrationType(
    input: DetermineRegistrationTypeInput,
  ): RegistrationType {
    const isGroup = input.ticket.isGroupTicket;
    const isPaid = (input.ticket.price || 0) > 0;

    if (isGroup && isPaid) {
      return RegistrationType.GROUP_PAID;
    }

    if (isGroup && !isPaid) {
      return RegistrationType.GROUP_FREE;
    }

    if (!isGroup && isPaid) {
      return RegistrationType.INDIVIDUAL_PAID;
    }

    return RegistrationType.INDIVIDUAL_FREE;
  }

  /**
   * Check if registration type is individual
   */
  static isIndividual(type: RegistrationType): boolean {
    return RegistrationTypeHelpers.isIndividual(type);
  }

  /**
   * Check if registration type is group
   */
  static isGroup(type: RegistrationType): boolean {
    return RegistrationTypeHelpers.isGroup(type);
  }

  /**
   * Check if registration type is free
   */
  static isFree(type: RegistrationType): boolean {
    return RegistrationTypeHelpers.isFree(type);
  }

  /**
   * Check if registration type is paid
   */
  static isPaid(type: RegistrationType): boolean {
    return RegistrationTypeHelpers.isPaid(type);
  }
}
