import { HydratedDocument, model, Schema } from 'mongoose';
import {
  PaymentGateway,
  PaymentMethod,
  PaymentStatus,
} from '../types/payment.enums';
import { ObjectId } from '@helpers/zod';

export interface IPayment {
  paymentOrderId: ObjectId;
  eventId: ObjectId;
  organizationId: ObjectId;
  registrationId: ObjectId;
  gateway: PaymentGateway;
  gatewayOrderId: string;
  gatewayPaymentId?: string;
  amount: number;
  currency: string;
  paymentMethod?: PaymentMethod;
  paymentReference: string;
  status: PaymentStatus;
  paidAt?: Date;
  failedAt?: Date;
  refundedAt?: Date;
  rawPaymentGatewayResponse?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export type PaymentDocument = HydratedDocument<IPayment>;
// export interface PaymentModel extends Model<PaymentDocument> {}

const PaymentSchema = new Schema<IPayment>(
  {
    paymentOrderId: {
      type: Schema.Types.ObjectId,
      ref: 'payment_orders',
      required: true,
      index: true,
    },
    eventId: {
      type: Schema.Types.ObjectId,
      ref: 'events',
      required: true,
      index: true,
    },
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'organizations',
      required: true,
      index: true,
    },
    registrationId: {
      type: Schema.Types.ObjectId,
      ref: 'registrations',
      required: true,
      index: true,
    },
    gateway: {
      type: String,
      enum: Object.values(PaymentGateway),
      required: true,
    },
    gatewayOrderId: { type: String, required: true, trim: true },
    gatewayPaymentId: { type: String, unique: true, trim: true, sparse: true },
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, required: true, uppercase: true },
    paymentMethod: {
      type: String,
      enum: Object.values(PaymentMethod),
    },
    paymentReference: {
      type: String,
      trim: true,
      required: true,
      unique: true,
      index: true,
    },
    status: {
      type: String,
      enum: Object.values(PaymentStatus),
      default: PaymentStatus.PENDING,
      index: true,
    },
    paidAt: Date,
    failedAt: Date,
    refundedAt: Date,
    rawPaymentGatewayResponse: { type: Schema.Types.Mixed, default: {} },
    metadata: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true, _id: true, versionKey: false },
);

PaymentSchema.index({ status: 1, registrationId: 1 });
PaymentSchema.index({ eventId: 1, status: 1 });
PaymentSchema.index({ organizationId: 1, eventId: 1 });
PaymentSchema.index({ gateway: 1, gatewayOrderId: 1 });
PaymentSchema.index(
  { gateway: 1, gatewayPaymentId: 1 },
  { unique: true, sparse: true },
);
PaymentSchema.index({ createdAt: -1 });

export const PaymentModel = model<IPayment>('payments', PaymentSchema);
