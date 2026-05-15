import { LedgerEntryType } from '../types/ledger.enums';
import { WalletCreditPayload } from '../types/wallet/wallet-credit.types';
import WalletAccountingService from './wallet.accounting.service';

class WalletDebitService {
  static async debit(payload: WalletCreditPayload) {
    const {
      organizationId,
      amount,
      balanceType,
      category,
      referenceType,
      referenceId,
      eventId,
      paymentId,
      description,
      metadata,
      createdBy,
    } = payload;

    return WalletAccountingService.applyEntries({
      organizationId: organizationId.toString(),
      entries: [
        {
          type: LedgerEntryType.DEBIT,
          category,
          amount,
          balanceType,
          referenceType,
          referenceId: referenceId.toString(),
          eventId: eventId?.toString(),
          paymentId: paymentId?.toString(),
          description,
          metadata,
          createdBy: createdBy?.toString(),
        },
      ],
    });
  }
}

export default WalletDebitService;
