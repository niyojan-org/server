import {
  LedgerBalanceType,
  LedgerCategory,
  LedgerEntryType,
  LedgerReferenceType,
} from '../types/ledger.enums';
import WalletAccountingService from './wallet.accounting.service';

export interface WalletTransferPayload {
  organizationId: string;
  amount: number;
  from: LedgerBalanceType;
  to: LedgerBalanceType;
  category: LedgerCategory;
  referenceType: LedgerReferenceType;
  referenceId: string;
  eventId?: string;
  paymentId?: string;
  refundId?: string;
  payoutId?: string;
  description?: string;
  metadata?: Record<string, unknown>;
  createdBy?: string;
}

class WalletTransferService {
  static async transfer(payload: WalletTransferPayload) {
    const {
      organizationId,
      amount,
      from,
      to,
      category,
      referenceType,
      referenceId,
      eventId,
      paymentId,
      refundId,
      payoutId,
      description,
      metadata,
      createdBy,
    } = payload;

    return WalletAccountingService.applyEntries({
      organizationId,
      entries: [
        {
          type: LedgerEntryType.DEBIT,
          category,
          amount,
          balanceType: from,
          referenceType,
          referenceId,
          eventId,
          paymentId,
          refundId,
          payoutId,
          description,
          metadata,
          createdBy,
        },
        {
          type: LedgerEntryType.CREDIT,
          category,
          amount,
          balanceType: to,
          referenceType,
          referenceId,
          eventId,
          paymentId,
          refundId,
          payoutId,
          description,
          metadata,
          createdBy,
        },
      ],
    });
  }
}

export default WalletTransferService;
