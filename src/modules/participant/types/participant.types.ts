import { objectIdSchema } from '@helpers/zod';
import { boolean, date, email, object, string, z } from 'zod';
import { ParticipantStatus } from '../constants/participant.constants';
import mongoose from 'mongoose';

export const participantSchema = object({
  registrationId: objectIdSchema,
  eventId: objectIdSchema,
  ticketId: objectIdSchema,
  name: string(),
  email: email(),
  phone: string().optional(),
  dynamicFields: object().optional(),
  qrCode: string().optional(),
  sessionCheckIns: object({
    sessionId: objectIdSchema,
    checkedIn: boolean(),
    checkedInAt: date().optional(),
    checkedInBy: objectIdSchema.optional(),
  })
    .array()
    .optional(),
  status: z.enum(ParticipantStatus).default(ParticipantStatus.REGISTERED),
  notifications: object({
    emailSent: boolean(),
    whatsAppSent: boolean(),
  }).optional(),
});

export type CreateParticipantDto = {
  registrationId: mongoose.Types.ObjectId;
  eventId: mongoose.Types.ObjectId;  
  ticketId: mongoose.Types.ObjectId;
  name: string;
  email: string;
  phone?: string;
  dynamicFields?: Record<string, unknown>;
}

export type Participant = z.infer<typeof participantSchema>;
