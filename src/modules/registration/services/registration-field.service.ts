import { CustomField, EventDocument } from '@modules/events/core/event.types';

class EventRegistrationFormService {
  /**
   * Get event registration details including form fields
   * Returns default fields and custom/dynamic fields
   */
  static async getEventRegistrationForm(event: EventDocument): Promise<{ fields: CustomField[]; totalFields: number }> {
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
    const dynamicFields: CustomField[] = (event.customFields || []).map((field, index) => ({
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

export default EventRegistrationFormService;
