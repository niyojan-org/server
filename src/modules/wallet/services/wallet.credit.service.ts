import mongoose from 'mongoose';
import WalletRepository from '../repositories/wallet.repository';
import LedgerEntryService from './ledger-entry.service';
import { LedgerBalanceType, LedgerEntryType } from '../types/ledger.enums';
import { WalletCreditPayload } from '../types/wallet/wallet-credit.types';
import { objectIdSchema } from '@helpers/zod';
import { WalletBalanceType } from '../types/wallet.enums';

const ledgerToWalletBalanceTypeMap: Record<
  LedgerBalanceType,
  WalletBalanceType
> = {
  [LedgerBalanceType.HOLD]: WalletBalanceType.HOLD,
  [LedgerBalanceType.AVAILABLE]: WalletBalanceType.AVAILABLE,
  [LedgerBalanceType.LOCKED]: WalletBalanceType.LOCKED,
};

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
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const wallet =
        await WalletRepository.findWalletByOrganizationId(organizationId);

      if (!wallet) {
        throw new Error('Wallet not found');
      }

      const walletId = objectIdSchema.parse(wallet._id);
      const walletBalanceType = ledgerToWalletBalanceTypeMap[balanceType];
      const beforeBalance = wallet[walletBalanceType] ?? 0;
      const afterBalance = beforeBalance + amount;

      const ledgerEntry = await LedgerEntryService.createEntry({
        organizationId,
        walletId,
        type: LedgerEntryType.CREDIT,
        category,
        amount,
        balanceType,
        beforeBalance,
        afterBalance,
        referenceType,
        referenceId,
        eventId,
        paymentId,
        description,
        metadata,
        createdBy,
        session,
      });

      const updatedWallet = await WalletRepository.updateBalance(
        walletId,
        walletBalanceType,
        amount,
        session,
      );

      await WalletRepository.updateLastLedgerEntry(
        walletId,
        ledgerEntry._id,
        session,
      );

      await session.commitTransaction();

      return {
        wallet: updatedWallet,
        ledgerEntry,
      };
    } catch (error) {
      await session.abortTransaction();

      throw error;
    } finally {
      session.endSession();
    }
  }
}

export default WalletCreditService;
