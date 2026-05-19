import { EventStatus } from '@modules/events/core/event.enums';
import { EventDocument } from '@modules/events/core/event.types';

export interface ValidationResult {
  valid: boolean;
  code?: string;
  message?: string;
}

export class EventRegistrationValidationService {
  /**
   * Validates if an event is eligible for registration
   * Checks: published status, not blocked, registration window, registration open flag
   */
  static async validateEventForRegistration(event: EventDocument): Promise<ValidationResult> {
    if (!event.isPublished) return { valid: false, code: 'EVENT_NOT_PUBLISHED', message: 'Event is not published.' };
    if (event.isBlocked) return { valid: false, code: 'EVENT_BLOCKED', message: 'Event registration is blocked.' };
    // Check event status - allow only PUBLISHED, ONGOING statuses
    if (event.status !== EventStatus.PUBLISHED && event.status !== EventStatus.ONGOING)
      return {
        valid: false,
        code: 'EVENT_INVALID_STATUS',
        message: `Event cannot accept registrations in ${event.status} status.`,
      };

    if (!event.isRegistrationOpen)
      return { valid: false, code: 'REGISTRATION_NOT_OPEN', message: 'Registration is not open for this event.' };

    const now = new Date();
    if (event.registrationStart && now < event.registrationStart)
      return { valid: false, code: 'REGISTRATION_NOT_STARTED', message: 'Event registration has not started yet.' };

    if (event.registrationEnd && now > event.registrationEnd)
      return { valid: false, code: 'REGISTRATION_ENDED', message: 'Event registration has ended.' };

    return { valid: true };
  }

  /**
   * Get event registration details including form fields
   * Returns default fields and custom/dynamic fields
   */
  static async getEventRegistrationForm(event: EventDocument) {
    // Default fields (always present)
    const defaultFields = [
      { name: 'name', label: 'Full Name', type: 'text', required: true, placeholder: 'Enter your full name', order: 1 },
      {
        name: 'email',
        label: 'Email',
        type: 'email',
        required: true,
        placeholder: 'Enter your email address',
        order: 2,
      },
      {
        name: 'phone',
        label: 'Phone Number',
        type: 'tel',
        required: true,
        placeholder: 'Enter your phone number',
        order: 3,
      },
    ];
    const dynamicFields = (event.customFields || []).map((field, index) => ({
      name: field.name,
      label: field.label,
      type: field.type,
      required: field.required || false,
      placeholder: field.placeholder,
      options: field.options,
      minLength: field.minLength,
      maxLength: field.maxLength,
      order: 4 + index,
    }));

    return {
      fields: [...defaultFields, ...dynamicFields],
      totalFields: defaultFields.length + dynamicFields.length,
    };
  }
}
