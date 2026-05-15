import { HydratedDocument, model, Schema } from 'mongoose';
import { ObjectId } from '@helpers/zod';
import { PayoutStatus } from '../types/payout.enums';
import { PaymentGateway } from '@modules/payments/types/payment.enums';

export interface IPayout {
  organizationId: ObjectId;
  amount: number;
  currency: string;
  status: PayoutStatus;
  reference: string;
  method?: string;
  gateway?: PaymentGateway;
  processedAt?: Date;
  failedAt?: Date;
  failureReason?: string;
  metadata?: Record<string, unknown>;
  createdBy?: ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export type PayoutDocument = HydratedDocument<IPayout>;

const PayoutSchema = new Schema<IPayout>(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'organizations',
      required: true,
      index: true,
    },
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, required: true, uppercase: true, default: 'INR' },
    status: {
      type: String,
      enum: Object.values(PayoutStatus),
      default: PayoutStatus.CREATED,
      index: true,
    },
    reference: { type: String, required: true, unique: true, index: true },
    method: { type: String, trim: true },
    gateway: {
      type: String,
      enum: Object.values(PaymentGateway),
    },
    processedAt: Date,
    failedAt: Date,
    failureReason: { type: String, trim: true },
    metadata: { type: Schema.Types.Mixed, default: {} },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'users',
    },
  },
  {
    timestamps: true,
    versionKey: false,
    collection: 'payouts',
  },
);

PayoutSchema.index({ organizationId: 1, status: 1, createdAt: -1 });

export const PayoutModel = model<IPayout>('payouts', PayoutSchema);
