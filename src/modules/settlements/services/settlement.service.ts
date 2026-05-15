import crypto from 'crypto';
import mongoose from 'mongoose';
import ApiError from '@core/errors/api.error';
import SettlementRepository from '../repositories/settlement.repository';
import WalletAccountingService from '@modules/wallet/services/wallet.accounting.service';
import {
  LedgerBalanceType,
  LedgerCategory,
  LedgerEntryType,
  LedgerReferenceType,
} from '@modules/wallet/types/ledger.enums';
import { ObjectId, objectIdSchema, toObjectId } from '@helpers/zod';

export interface SettlementReleasePayload {
  organizationId: ObjectId | string;
  eventId: ObjectId | string;
  amount: number;
  currency?: string;
  createdBy?: ObjectId | string;
  metadata?: Record<string, unknown>;
}

class SettlementService {
  static async releaseHoldToAvailable(payload: SettlementReleasePayload) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const reference = `SET-${Date.now()}-${crypto.randomUUID()}`;
      const organizationId = objectIdSchema.parse(payload.organizationId);
      const eventId = objectIdSchema.parse(payload.eventId);
      const settlement = await SettlementRepository.createSettlement(
        {
          organizationId,
          eventId,
          amount: payload.amount,
          currency: payload.currency ?? 'INR',
          reference,
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
            category: LedgerCategory.SETTLEMENT_RELEASE,
            amount: payload.amount,
            balanceType: LedgerBalanceType.HOLD,
            referenceType: LedgerReferenceType.SETTLEMENT,
            referenceId: settlement._id.toString(),
            eventId: eventId.toString(),
            description: 'Settlement released from hold balance',
            createdBy: payload.createdBy?.toString(),
          },
          {
            type: LedgerEntryType.CREDIT,
            category: LedgerCategory.SETTLEMENT_RELEASE,
            amount: payload.amount,
            balanceType: LedgerBalanceType.AVAILABLE,
            referenceType: LedgerReferenceType.SETTLEMENT,
            referenceId: settlement._id.toString(),
            eventId: eventId.toString(),
            description: 'Settlement moved to available balance',
            createdBy: payload.createdBy?.toString(),
          },
        ],
        session,
      });

      const releasedSettlement = await SettlementRepository.markReleased(
        settlement._id,
        new Date(),
        session,
      );

      await session.commitTransaction();

      return releasedSettlement;
    } catch (error) {
      await session.abortTransaction();
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(500, 'Settlement failed', 'SETTLEMENT_FAILED');
    } finally {
      session.endSession();
    }
  }
}

export default SettlementService;
