import { HydratedDocument, model, Schema } from 'mongoose';
import { ObjectId } from '@helpers/zod';
import { SettlementStatus } from '../types/settlement.enums';

export interface ISettlement {
  organizationId: ObjectId;
  eventId: ObjectId;
  amount: number;
  currency: string;
  status: SettlementStatus;
  reference: string;
  releasedAt?: Date;
  failedAt?: Date;
  failureReason?: string;
  metadata?: Record<string, unknown>;
  createdBy?: ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export type SettlementDocument = HydratedDocument<ISettlement>;

const SettlementSchema = new Schema<ISettlement>(
  {
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
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, required: true, uppercase: true, default: 'INR' },
    status: {
      type: String,
      enum: Object.values(SettlementStatus),
      default: SettlementStatus.PENDING,
      index: true,
    },
    reference: { type: String, required: true, unique: true, index: true },
    releasedAt: Date,
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
    collection: 'settlements',
  },
);

SettlementSchema.index({ organizationId: 1, eventId: 1, createdAt: -1 });

export const SettlementModel = model<ISettlement>('settlements', SettlementSchema);
