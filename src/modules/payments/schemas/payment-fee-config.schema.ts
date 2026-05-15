import { HydratedDocument, model, Schema } from 'mongoose';
import { ObjectId } from '@helpers/zod';
import { PaymentGateway } from '../types/payment.enums';

export interface IPaymentFeeConfig {
  organizationId: ObjectId;
  gateway: PaymentGateway;
  platformFeePercent?: number;
  platformFeeFlat?: number;
  gatewayFeePercent?: number;
  gatewayFeeFlat?: number;
  taxPercent?: number;
  taxFlat?: number;
  active: boolean;
  createdBy?: ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export type PaymentFeeConfigDocument = HydratedDocument<IPaymentFeeConfig>;

const PaymentFeeConfigSchema = new Schema<IPaymentFeeConfig>(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'organizations',
      required: true,
      index: true,
    },
    gateway: {
      type: String,
      enum: Object.values(PaymentGateway),
      required: true,
      index: true,
    },
    platformFeePercent: { type: Number, min: 0 },
    platformFeeFlat: { type: Number, min: 0 },
    gatewayFeePercent: { type: Number, min: 0 },
    gatewayFeeFlat: { type: Number, min: 0 },
    taxPercent: { type: Number, min: 0 },
    taxFlat: { type: Number, min: 0 },
    active: { type: Boolean, default: true, index: true },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'users',
    },
  },
  {
    timestamps: true,
    versionKey: false,
    collection: 'payment_fee_configs',
  },
);

PaymentFeeConfigSchema.index({ organizationId: 1, gateway: 1, active: 1 });
PaymentFeeConfigSchema.index({ organizationId: 1, createdAt: -1 });

export const PaymentFeeConfigModel = model<IPaymentFeeConfig>(
  'payment_fee_configs',
  PaymentFeeConfigSchema,
);
