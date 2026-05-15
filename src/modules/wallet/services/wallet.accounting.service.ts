import mongoose, { ClientSession } from 'mongoose';
import ApiError from '@core/errors/api.error';
import WalletRepository from '../repositories/wallet.repository';
import LedgerEntryService from './ledger-entry.service';
import {
  LedgerBalanceType,
  LedgerCategory,
  LedgerEntryType,
  LedgerReferenceType,
} from '../types/ledger.enums';
import { WalletBalanceType } from '../types/wallet.enums';
import { objectIdSchema } from '@helpers/zod';

export interface WalletLedgerEntryInput {
  type: LedgerEntryType;
  category: LedgerCategory;
  amount: number;
  balanceType: LedgerBalanceType;
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

export interface WalletAccountingPayload {
  organizationId: string;
  entries: WalletLedgerEntryInput[];
  extraIncrements?: Record<string, number>;
  session?: ClientSession;
}

const ledgerToWalletBalanceTypeMap: Record<LedgerBalanceType, WalletBalanceType> = {
  [LedgerBalanceType.HOLD]: WalletBalanceType.HOLD,
  [LedgerBalanceType.AVAILABLE]: WalletBalanceType.AVAILABLE,
  [LedgerBalanceType.LOCKED]: WalletBalanceType.LOCKED,
  [LedgerBalanceType.WITHDRAWN]: WalletBalanceType.WITHDRAWN,
  [LedgerBalanceType.REFUNDED]: WalletBalanceType.REFUNDED,
};

class WalletAccountingService {
  static async applyEntries({
    organizationId,
    entries,
    extraIncrements,
    session: providedSession,
  }: WalletAccountingPayload) {
    const session = providedSession ?? (await mongoose.startSession());
    if (!providedSession) {
      session.startTransaction();
    }

    try {
      const wallet = await WalletRepository.findWalletByOrganizationId(
        organizationId,
      );

      if (!wallet) {
        throw new ApiError(404, 'Wallet not found', 'WALLET_NOT_FOUND');
      }

      if (wallet.isFrozen) {
        throw new ApiError(
          403,
          'Wallet is frozen',
          'WALLET_FROZEN',
          wallet.frozenReason ?? 'Wallet is frozen',
        );
      }

      const walletId = objectIdSchema.parse(wallet._id);
      const runningBalances: Record<WalletBalanceType, number> = {
        [WalletBalanceType.HOLD]: wallet.holdBalance ?? 0,
        [WalletBalanceType.AVAILABLE]: wallet.availableBalance ?? 0,
        [WalletBalanceType.LOCKED]: wallet.lockedBalance ?? 0,
        [WalletBalanceType.WITHDRAWN]: wallet.withdrawnBalance ?? 0,
        [WalletBalanceType.REFUNDED]: wallet.refundedBalance ?? 0,
      };

      const preparedEntries = entries.map((entry) => {
        const walletBalanceType = ledgerToWalletBalanceTypeMap[entry.balanceType];
        const beforeBalance = runningBalances[walletBalanceType] ?? 0;
        const delta = entry.type === LedgerEntryType.CREDIT ? entry.amount : -entry.amount;
        const afterBalance = beforeBalance + delta;

        if (entry.amount <= 0) {
          throw new ApiError(400, 'Amount must be greater than 0', 'INVALID_AMOUNT');
        }
        if (afterBalance < 0) {
          throw new ApiError(
            400,
            'Wallet balance cannot go below 0',
            'INSUFFICIENT_WALLET_BALANCE',
            `Balance type ${entry.balanceType} is insufficient`,
          );
        }

        runningBalances[walletBalanceType] = afterBalance;

        return {
          organizationId,
          walletId,
          type: entry.type,
          category: entry.category,
          amount: entry.amount,
          balanceType: entry.balanceType,
          beforeBalance,
          afterBalance,
          referenceType: entry.referenceType,
          referenceId: entry.referenceId,
          eventId: entry.eventId,
          paymentId: entry.paymentId,
          refundId: entry.refundId,
          payoutId: entry.payoutId,
          description: entry.description,
          metadata: entry.metadata,
          createdBy: entry.createdBy,
        };
      });

      const ledgerEntries = await LedgerEntryService.createEntries(
        preparedEntries,
        session,
      );

      const balanceIncrements: Record<string, number> = {};
      for (const entry of preparedEntries) {
        const walletBalanceType = ledgerToWalletBalanceTypeMap[entry.balanceType];
        const delta = entry.type === LedgerEntryType.CREDIT ? entry.amount : -entry.amount;
        balanceIncrements[walletBalanceType] =
          (balanceIncrements[walletBalanceType] ?? 0) + delta;
      }

      if (extraIncrements) {
        for (const [key, value] of Object.entries(extraIncrements)) {
          if (typeof value !== 'number') {
            continue;
          }
          balanceIncrements[key] = (balanceIncrements[key] ?? 0) + value;
        }
      }

      const updatedWallet = await WalletRepository.updateBalances(
        walletId,
        balanceIncrements,
        session,
      );

      const lastLedgerEntryId =
        ledgerEntries[ledgerEntries.length - 1]?._id ?? wallet.lastLedgerEntryId;

      if (lastLedgerEntryId) {
        await WalletRepository.updateLastLedgerEntry(
          walletId,
          lastLedgerEntryId,
          session,
        );
      }

      if (!providedSession) {
        await session.commitTransaction();
      }

      return {
        wallet: updatedWallet,
        ledgerEntries,
      };
    } catch (error) {
      if (!providedSession) {
        await session.abortTransaction();
      }
      throw error;
    } finally {
      if (!providedSession) {
        session.endSession();
      }
    }
  }
}

export default WalletAccountingService;
