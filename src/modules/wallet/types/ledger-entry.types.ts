import { ObjectId } from '@helpers/zod';
import {
  LedgerBalanceType,
  LedgerCategory,
  LedgerEntryType,
  LedgerReferenceType,
} from './ledger.enums';
import { ClientSession } from 'mongoose';

export interface CreateLedgerEntryPayload {
  organizationId: ObjectId | string;
  walletId: ObjectId | string;
  type: LedgerEntryType;
  category: LedgerCategory;
  amount: number;
  balanceType: LedgerBalanceType;
  beforeBalance: number;
  afterBalance: number;
  referenceType: LedgerReferenceType;
  referenceId: ObjectId | string;
  eventId?: ObjectId | string;
  paymentId?: ObjectId | string;
  refundId?: ObjectId | string;
  payoutId?: ObjectId | string;
  description?: string;
  metadata?: Record<string, unknown>;
  createdBy?: ObjectId | string;
  session?: ClientSession;
}
