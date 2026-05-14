import { HydratedDocument, model, Schema } from 'mongoose';
import { PaymentGateway } from '../types/payment.enums';
import { PaymentOrderStatus } from '../types/payment-order.enums';
import { ObjectId } from '@helpers/zod';

export interface IPaymentOrder {
  registrationId: ObjectId;
  organizationId: ObjectId;
  eventId: ObjectId;
  gateway: PaymentGateway;
  gatewayOrderId: string;
  paymentOrderReference: string;
  amount: number;
  currency: string;
  expiresAt?: Date;
  attemptedAt?: Date;
  paidAt?: Date;
  failedAt?: Date;
  expiredAt?: Date;
  cancelledAt?: Date;
  status: PaymentOrderStatus;
  failureReason?: string;
  metadata?: Record<string, unknown>;
  gatewayOrderPayload?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export type PaymentOrderDocument = HydratedDocument<IPaymentOrder>;

//SCHEMA

const PaymentOrderSchema = new Schema<IPaymentOrder>(
  {
    registrationId: {
      type: Schema.Types.ObjectId,
      ref: 'registrations',
      required: true,
      index: true,
    },
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'organizations',
      required: true,
      index: true,
    },
    eventId: {
      type: Schema.Types.ObjectId,
      ref: 'events',
      required: true,
      index: true,
    },
    gateway: {
      type: String,
      enum: Object.values(PaymentGateway),
      required: true,
      index: true,
    },
    gatewayOrderId: { type: String, required: true, trim: true, index: true },
    paymentOrderReference: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      index: true,
    },
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, required: true, uppercase: true, default: 'INR' },
    expiresAt: { type: Date, index: true },
    attemptedAt: { type: Date },
    paidAt: { type: Date },
    failedAt: { type: Date },
    expiredAt: { type: Date },
    status: {
      type: String,
      enum: Object.values(PaymentOrderStatus),
      required: true,
      default: PaymentOrderStatus.CREATED,
      index: true,
    },
    failureReason: { type: String, trim: true },
    metadata: { type: Schema.Types.Mixed, default: {} },
    gatewayOrderPayload: { type: Schema.Types.Mixed, default: {} },
  },
  {
    timestamps: true,
    versionKey: false,
    _id: true,
    collection: 'payment_orders',
  },
);

//indexes
PaymentOrderSchema.index({ registrationId: 1, status: 1 });
PaymentOrderSchema.index({ organizationId: 1, eventId: 1 });
PaymentOrderSchema.index({ gateway: 1, gatewayOrderId: 1 });
PaymentOrderSchema.index({ createdAt: -1 });

export const PaymentOrderModel = model<IPaymentOrder>(
  'payment_orders',
  PaymentOrderSchema,
);
