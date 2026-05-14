import { ObjectId } from '@helpers/zod';
import {
  LedgerBalanceType,
  LedgerCategory,
  LedgerReferenceType,
} from '../ledger.enums';

export interface WalletCreditPayload {
  organizationId: ObjectId | string;
  amount: number;
  balanceType: LedgerBalanceType;
  category: LedgerCategory;
  referenceType: LedgerReferenceType;
  referenceId: ObjectId | string;
  eventId?: ObjectId | string;
  paymentId?: ObjectId | string;
  description?: string;
  metadata?: Record<string, unknown>;
  createdBy?: ObjectId | string;
}
