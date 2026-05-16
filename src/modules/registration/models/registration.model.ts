import mongoose, { Schema } from 'mongoose';

import { RegistrationStatus } from '../constants/registration.constants';

const registrationPricingSchema = new Schema(
  {
    subtotal: {
      type: Number,
      required: true,
      default: 0,
    },
    discount: {
      type: Number,
      required: true,
      default: 0,
    },
    tax: {
      type: Number,
      required: true,
      default: 0,
    },
    total: {
      type: Number,
      required: true,
      default: 0,
    },
    currency: {
      type: String,
      required: true,
      default: 'INR',
    },
  },
  { _id: false },
);

const registrationCouponSchema = new Schema(
  {
    code: {
      type: String,
    },
    discountAmount: {
      type: Number,
      default: 0,
    },
  },
  { _id: false },
);

const registrationGroupInfoSchema = new Schema(
  {
    groupName: {
      type: String,
      trim: true,
    },
    totalMembers: {
      type: Number,
      required: true,
      default: 1,
    },
  },
  { _id: false },
);

const registrationSchema = new Schema(
  {
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
    participantIds: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Participant',
      },
    ],
    participantsCount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(RegistrationStatus),
      required: true,
      default: RegistrationStatus.DRAFT,
      index: true,
    },
    pricing: {
      type: registrationPricingSchema,
      required: true,
    },
    coupon: {
      type: registrationCouponSchema,
    },
    groupInfo: {
      type: registrationGroupInfoSchema,
    },
    paymentId: {
      type: Schema.Types.ObjectId,
      ref: 'Payment',
    },
  },
  {
    timestamps: true,
  },
);

registrationSchema.index({
  eventId: 1,
  status: 1,
});

registrationSchema.index({
  ticketId: 1,
});

export const RegistrationModel = mongoose.model(
  'Registration',
  registrationSchema,
);
