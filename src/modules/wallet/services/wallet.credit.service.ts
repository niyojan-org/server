import { LedgerEntryType } from '../types/ledger.enums';
import { WalletCreditPayload } from '../types/wallet/wallet-credit.types';
import WalletAccountingService from './wallet.accounting.service';

class WalletCreditService {
  static async credit({
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
  }: WalletCreditPayload) {
    return WalletAccountingService.applyEntries({
      organizationId: organizationId.toString(),
      entries: [
        {
          type: LedgerEntryType.CREDIT,
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

export default WalletCreditService;
