import { HydratedDocument, model, Schema } from 'mongoose';
import { ObjectId } from '@helpers/zod';

export interface IWallet {
  _id?: ObjectId;
  organizationId: ObjectId;
  holdBalance: number; // Money currently held by platform.
  availableBalance: number; // Money available for organization withdrawal.
  lockedBalance: number; // Money locked due to disputes, refund, etc.
  withdrawnBalance: number; // Total money withdrawn by organization lifetime.
  refundedBalance: number; // Total money refunded to customers lifetime.
  totalEarning: number; // Total money earned by organization lifetime (including refunded amount).
  currency: string;
  isFrozen: boolean; // If true, no transactions allowed until unfrozen.
  frozenReason?: string; // Reason for freezing the wallet.
  lastLedgerEntryId?: ObjectId; // Reference to the last ledger entry for balance reconciliation.
  createdAt: Date;
  updatedAt: Date;
}

export type WalletDocument = HydratedDocument<IWallet>;

const WalletSchema = new Schema<IWallet>(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organizations',
      required: true,
      unique: true,
    },
    holdBalance: { type: Number, required: true, default: 0, min: 0 },
    availableBalance: { type: Number, required: true, default: 0, min: 0 },
    lockedBalance: { type: Number, required: true, default: 0, min: 0 },
    withdrawnBalance: { type: Number, required: true, default: 0, min: 0 },
    refundedBalance: { type: Number, required: true, default: 0, min: 0 },
    totalEarning: { type: Number, required: true, default: 0 },
    currency: { type: String, required: true, uppercase: true, default: 'INR' },
    isFrozen: { type: Boolean, required: true, default: false },
    frozenReason: { type: String, trim: true },
    lastLedgerEntryId: {
      type: Schema.Types.ObjectId,
      ref: 'ledger_entries',
      trim: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
    collection: 'wallets',
  },
);

//indexes
WalletSchema.index({ isFrozen: 1 });
WalletSchema.index({ createdAt: -1 });

export const WalletModel = model<IWallet>('wallet', WalletSchema);
