import crypto from 'crypto';
import mongoose from 'mongoose';
import ApiError from '@core/errors/api.error';
import PayoutRepository from '../repositories/payout.repository';
import { PayoutStatus } from '../types/payout.enums';
import WalletAccountingService from '@modules/wallet/services/wallet.accounting.service';
import {
  LedgerBalanceType,
  LedgerCategory,
  LedgerEntryType,
  LedgerReferenceType,
} from '@modules/wallet/types/ledger.enums';
import { PaymentGateway } from '@modules/payments/types/payment.enums';
import { ObjectId, objectIdSchema, toObjectId } from '@helpers/zod';

export interface CreatePayoutPayload {
  organizationId: ObjectId | string;
  amount: number;
  currency?: string;
  method?: string;
  gateway?: PaymentGateway;
  metadata?: Record<string, unknown>;
  createdBy?: ObjectId | string;
}

class PayoutService {
  static async initiatePayout(payload: CreatePayoutPayload) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const reference = `POUT-${Date.now()}-${crypto.randomUUID()}`;
      const organizationId = objectIdSchema.parse(payload.organizationId);
      const payout = await PayoutRepository.createPayout(
        {
          organizationId,
          amount: payload.amount,
          currency: payload.currency ?? 'INR',
          reference,
          method: payload.method,
          gateway: payload.gateway,
          metadata: payload.metadata,
          createdBy: toObjectId(payload.createdBy),
        },
        session,
      );

      await WalletAccountingService.applyEntries({
        organizationId: organizationId.toString(),
        entries: [
          {
            type: LedgerEntryType.DEBIT,
            category: LedgerCategory.PAYOUT_LOCK,
            amount: payload.amount,
            balanceType: LedgerBalanceType.AVAILABLE,
            referenceType: LedgerReferenceType.PAYOUT,
            referenceId: payout._id.toString(),
            payoutId: payout._id.toString(),
            description: 'Payout amount locked',
            createdBy: payload.createdBy?.toString(),
          },
          {
            type: LedgerEntryType.CREDIT,
            category: LedgerCategory.PAYOUT_LOCK,
            amount: payload.amount,
            balanceType: LedgerBalanceType.LOCKED,
            referenceType: LedgerReferenceType.PAYOUT,
            referenceId: payout._id.toString(),
            payoutId: payout._id.toString(),
            description: 'Payout amount moved to locked balance',
            createdBy: payload.createdBy?.toString(),
          },
        ],
        session,
      });

      const updatedPayout = await PayoutRepository.updateStatus(
        payout._id,
        PayoutStatus.LOCKED,
        {},
        session,
      );

      await session.commitTransaction();

      return updatedPayout;
    } catch (error) {
      await session.abortTransaction();
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(500, 'Payout initiation failed', 'PAYOUT_FAILED');
    } finally {
      session.endSession();
    }
  }

  static async markProcessing(payoutId: ObjectId | string) {
    const payout = await PayoutRepository.findById(payoutId);
    if (!payout) {
      throw new ApiError(404, 'Payout not found', 'PAYOUT_NOT_FOUND');
    }
    return PayoutRepository.updateStatus(payoutId, PayoutStatus.PROCESSING);
  }

  static async markSuccess(payoutId: ObjectId | string) {
    const payout = await PayoutRepository.findById(payoutId);
    if (!payout) {
      throw new ApiError(404, 'Payout not found', 'PAYOUT_NOT_FOUND');
    }

    await WalletAccountingService.applyEntries({
      organizationId: payout.organizationId.toString(),
      entries: [
        {
          type: LedgerEntryType.DEBIT,
          category: LedgerCategory.PAYOUT_SUCCESS,
          amount: payout.amount,
          balanceType: LedgerBalanceType.LOCKED,
          referenceType: LedgerReferenceType.PAYOUT,
          referenceId: payout._id.toString(),
          payoutId: payout._id.toString(),
          description: 'Payout completed from locked balance',
        },
        {
          type: LedgerEntryType.CREDIT,
          category: LedgerCategory.PAYOUT_SUCCESS,
          amount: payout.amount,
          balanceType: LedgerBalanceType.WITHDRAWN,
          referenceType: LedgerReferenceType.PAYOUT,
          referenceId: payout._id.toString(),
          payoutId: payout._id.toString(),
          description: 'Payout recorded as withdrawn',
        },
      ],
      extraIncrements: {
        withdrawnBalance: payout.amount,
      },
    });

    return PayoutRepository.updateStatus(payoutId, PayoutStatus.SUCCESS, {
      processedAt: new Date(),
    });
  }

  static async markFailed(payoutId: ObjectId | string, reason?: string) {
    const payout = await PayoutRepository.findById(payoutId);
    if (!payout) {
      throw new ApiError(404, 'Payout not found', 'PAYOUT_NOT_FOUND');
    }

    await WalletAccountingService.applyEntries({
      organizationId: payout.organizationId.toString(),
      entries: [
        {
          type: LedgerEntryType.DEBIT,
          category: LedgerCategory.PAYOUT_FAILED,
          amount: payout.amount,
          balanceType: LedgerBalanceType.LOCKED,
          referenceType: LedgerReferenceType.PAYOUT,
          referenceId: payout._id.toString(),
          payoutId: payout._id.toString(),
          description: 'Payout failed; release locked balance',
        },
        {
          type: LedgerEntryType.CREDIT,
          category: LedgerCategory.PAYOUT_FAILED,
          amount: payout.amount,
          balanceType: LedgerBalanceType.AVAILABLE,
          referenceType: LedgerReferenceType.PAYOUT,
          referenceId: payout._id.toString(),
          payoutId: payout._id.toString(),
          description: 'Payout failed; funds returned to available balance',
        },
      ],
    });

    return PayoutRepository.updateStatus(payoutId, PayoutStatus.FAILED, {
      failedAt: new Date(),
      failureReason: reason,
    });
  }
}

export default PayoutService;
