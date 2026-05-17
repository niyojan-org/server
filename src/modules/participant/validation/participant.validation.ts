import { ObjectId } from '@helpers/zod';
import { ParticipantModel } from '../models/participant.model';
import { ParticipantValidationErrorCode } from '../constants/participant.constants';

class ParticipantValidation {
  static async validate(eventId: ObjectId, emails: string[]) {
    const normalizedEmails = emails.map((email) => email.toLowerCase().trim());
    const existingParticipants = await ParticipantModel.find({
      eventId,
      email: { $in: normalizedEmails },
    })
      .select('email name')
      .lean();
    if (existingParticipants.length > 0) {
      return {
        valid: false,
        code: ParticipantValidationErrorCode.DUPLICATE_PARTICIPANTS,
        message: `${emails.length == 1 ? 'You have' : 'Some participants are'} already registered for this event`,
        emails: existingParticipants.map((participant) => participant.email),
      };
    }
    return { valid: true };
  }
}

export default ParticipantValidation;
