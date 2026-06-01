import mongoose, { PaginateModel, Schema } from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
import { RegistrationStatus, RegistrationType } from '../constants/registration.constants';

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
    registrationId: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
      trim: true,
      uppercase: true,
    },
    eventId: { type: Schema.Types.ObjectId, ref: 'Event', required: true, index: true },
    ticketId: { type: Schema.Types.ObjectId, ref: 'EventTicket', required: true },
    participantIds: [{ type: Schema.Types.ObjectId, ref: 'Participant' }],
    participantsCount: { type: Number, required: true },
    status: {
      type: String,
      enum: Object.values(RegistrationStatus),
      required: true,
      default: RegistrationStatus.DRAFT,
      index: true,
    },
    registrationType: { type: String, enum: Object.values(RegistrationType), index: true },
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

registrationSchema.index({ ticketId: 1 });

registrationSchema.index({
  eventId: 1,
  registrationId: 1,
});

//plugins
registrationSchema.plugin(mongoosePaginate);

export type RegistrationDocument = mongoose.HydratedDocument<RegistrationSchema>;

export type RegistrationSchema = mongoose.InferSchemaType<typeof registrationSchema>;

export type RegistrationModel = PaginateModel<RegistrationDocument>;

export const RegistrationModel = mongoose.model<RegistrationDocument, RegistrationModel>(
  'Registration',
  registrationSchema,
);
