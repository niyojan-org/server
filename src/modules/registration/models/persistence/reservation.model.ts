import mongoose, { Schema, Types, Model } from 'mongoose';

const ReservationSchema = new Schema(
  {
    eventId: {
      type: Types.ObjectId,
      ref: 'Event',
      required: true,
      index: true,
    },
    ticketId: {
      type: Types.ObjectId,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    registrationId: {
      type: Types.ObjectId,
      ref: 'Registration',
      index: true,
    },
    sessionId: String,
    userId: Types.ObjectId,

    status: {
      type: String,
      enum: ['active', 'confirmed', 'expired', 'cancelled'],
      default: 'active',
    },

    expiresAt: {
      type: Date,
      index: { expireAfterSeconds: 0 },
      required: true,
    },
  },
  { timestamps: true },
);

// Compound indexes for checking active reservations
ReservationSchema.index({ ticketId: 1, status: 1 });
ReservationSchema.index({ eventId: 1, ticketId: 1, status: 1 });
ReservationSchema.index({ registrationId: 1 });

export type ReservationDocument = mongoose.HydratedDocument<
  mongoose.InferSchemaType<typeof ReservationSchema>
>;

export const ReservationModel: Model<ReservationDocument> =
  mongoose.models.Reservation || mongoose.model<ReservationDocument>('Reservation', ReservationSchema);
