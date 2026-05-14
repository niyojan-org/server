import { HydratedDocument, model, Schema, PaginateModel } from 'mongoose';
import {
  LedgerBalanceType,
  LedgerCategory,
  LedgerEntryType,
  LedgerReferenceType,
} from '../types/ledger.enums';
import { ObjectId } from '@helpers/zod';
import mongoosePaginate from 'mongoose-paginate-v2';

export interface ILedgerEntry {
  organizationId: ObjectId;
  walletId: ObjectId;
  type: LedgerEntryType;
  category: LedgerCategory;
  amount: number;
  currency: string;
  balanceType: LedgerBalanceType;
  beforeBalance: number;
  afterBalance: number;
  referenceType: LedgerReferenceType;
  referenceId: ObjectId;
  eventId?: ObjectId;
  paymentId?: ObjectId;
  refundId?: ObjectId;
  payoutId?: ObjectId;
  description?: string;
  metadata?: Record<string, unknown>;
  transactionReference?: string;
  createdBy?: ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export type LedgerEntryDocument = HydratedDocument<ILedgerEntry>;

const LedgerEntrySchema = new Schema<ILedgerEntry>(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'organizations',
      required: true,
      index: true,
    },
    walletId: {
      type: Schema.Types.ObjectId,
      ref: 'wallets',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: Object.values(LedgerEntryType),
      required: true,
      index: true,
    },
    category: {
      type: String,
      enum: Object.values(LedgerCategory),
      required: true,
      index: true,
    },
    amount: { type: Number, required: true, min: 0 },
    currency: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
      default: 'INR',
    },
    balanceType: {
      type: String,
      enum: Object.values(LedgerBalanceType),
      required: true,
      index: true,
    },
    beforeBalance: { type: Number, required: true, min: 0 },
    afterBalance: { type: Number, required: true, min: 0 },
    referenceType: {
      type: String,
      enum: Object.values(LedgerReferenceType),
      required: true,
      index: true,
    },
    referenceId: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    eventId: {
      type: Schema.Types.ObjectId,
      ref: 'events',
      index: true,
    },
    paymentId: {
      type: Schema.Types.ObjectId,
      ref: 'payments',
      index: true,
    },
    refundId: {
      type: Schema.Types.ObjectId,
      ref: 'refunds',
      index: true,
    },
    payoutId: {
      type: Schema.Types.ObjectId,
      ref: 'payouts',
      index: true,
    },
    description: { type: String, trim: true },
    transactionReference: { type: String, trim: true },
    metadata: { type: Schema.Types.Mixed, default: {} },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'users',
    },
  },
  {
    timestamps: true,
    versionKey: false,
    collection: 'ledger_entries',
  },
);

//index
LedgerEntrySchema.index({ organizationId: 1, createdAt: -1 });
LedgerEntrySchema.index({ walletId: 1, createdAt: -1 });
LedgerEntrySchema.index({ referenceType: 1, referenceId: 1 });
LedgerEntrySchema.index({ category: 1, balanceType: 1 });
LedgerEntrySchema.index({ eventId: 1, createdAt: -1 });
LedgerEntrySchema.index({ paymentId: 1, createdAt: -1 });
LedgerEntrySchema.index({ type: 1, createdAt: -1 });

//plugin
LedgerEntrySchema.plugin(mongoosePaginate);

export type LedgerEntryModel = PaginateModel<ILedgerEntry>;

export const LedgerEntryModel = model<ILedgerEntry, LedgerEntryModel>(
  'ledger_entries',
  LedgerEntrySchema,
);
