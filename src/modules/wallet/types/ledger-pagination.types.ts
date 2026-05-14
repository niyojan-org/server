import { ObjectId } from '@helpers/zod';
import { LedgerCategory } from './ledger.enums';
import { LedgerEntryType } from './ledger.enums';
import { LedgerBalanceType } from './ledger.enums';
import { ILedgerEntry } from '../schemas/ledger-entry.schema';

export interface LedgerPaginationQuery {
  page?: number;
  limit?: number;
  category?: LedgerCategory;
  type?: LedgerEntryType;
  balanceType?: LedgerBalanceType;
  organizationId?: ObjectId | string;
  walletId?: ObjectId | string;
  eventId?: ObjectId | string;
  paymentId?: ObjectId | string;
  refundId?: ObjectId | string;
  payoutId?: ObjectId | string;
  referenceId?: ObjectId | string;
  referenceType?: ILedgerEntry['referenceType'];
  fromDate?: Date;
  toDate?: Date;
}
