import mongoose, { Schema } from 'mongoose';
import { ParticipantStatus } from '../constants/participant.constants';

const participantSessionCheckInSchema = new Schema(
  {
    sessionId: { type: Schema.Types.ObjectId, required: true },
    checkedIn: { type: Boolean, default: false },
    checkedInAt: { type: Date },
    checkedInBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { _id: false, timestamps: true },
);

const participantSchema = new Schema(
  {
    registrationId: {
      type: Schema.Types.ObjectId,
      ref: 'Registration',
      required: true,
      index: true,
    },
    eventId: {
      type: Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
      index: true,
    },
    ticketId: {
      type: Schema.Types.ObjectId,
      ref: 'EventTicket',
      required: true,
    },
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    phone: { type: String, required: true, trim: true },
    dynamicFields: { type: Map, of: Schema.Types.Mixed, default: {} },
    qrCode: { type: String },
    sessionCheckIns: [participantSessionCheckInSchema],
    status: {
      type: String,
      enum: Object.values(ParticipantStatus),
      default: ParticipantStatus.REGISTERED,
    },
    notifications: {
      emailSent: { type: Boolean, default: false },
      whatsAppSent: { type: Boolean, default: false },
    },
  },
  { timestamps: true },
);

participantSchema.index({ eventId: 1, email: 1 }, { unique: true });

export type ParticipantDocument = mongoose.HydratedDocument<ParticipantSchema>;
export type ParticipantSchema = mongoose.InferSchemaType<typeof participantSchema>;

export const ParticipantModel = mongoose.model('Participant', participantSchema);
