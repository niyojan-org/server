import LedgerRepository from '../repositories/ledger.repository';
import { CreateLedgerEntryPayload } from '../types/ledger-entry.types';
import { objectIdSchema, toObjectId } from '@helpers/zod';

class LedgerEntryService {
  static async createEntry({
    organizationId,
    walletId,
    type,
    category,
    amount,
    balanceType,
    beforeBalance,
    afterBalance,
    referenceType,
    referenceId,
    eventId,
    paymentId,
    refundId,
    payoutId,
    description,
    metadata,
    createdBy,
    session,
  }: CreateLedgerEntryPayload) {
    if (amount <= 0) {
      throw new Error('Ledger amount must be greater than 0');
    }
    if (afterBalance < 0) {
      throw new Error('Wallet balance cannot go below 0');
    }

    const ledgerEntry = await LedgerRepository.createEntry(
      {
        organizationId: objectIdSchema.parse(organizationId),
        walletId: objectIdSchema.parse(walletId),
        type,
        category,
        amount,
        balanceType,
        beforeBalance,
        afterBalance,
        referenceType,
        referenceId: objectIdSchema.parse(referenceId),
        eventId: toObjectId(eventId),
        paymentId: toObjectId(paymentId),
        refundId: toObjectId(refundId),
        payoutId: toObjectId(payoutId),
        description,
        metadata: metadata ?? {},
        createdBy: toObjectId(createdBy),
      },
      session,
    );
    return ledgerEntry;
  }

  static async createEntries(
    entries: CreateLedgerEntryPayload[],
    session?: CreateLedgerEntryPayload['session'],
  ) {
    const prepared = entries.map((entry) => {
      if (entry.amount <= 0) {
        throw new Error('Ledger amount must be greater than 0');
      }
      if (entry.afterBalance < 0) {
        throw new Error('Wallet balance cannot go below 0');
      }

      return {
        organizationId: objectIdSchema.parse(entry.organizationId),
        walletId: objectIdSchema.parse(entry.walletId),
        type: entry.type,
        category: entry.category,
        amount: entry.amount,
        balanceType: entry.balanceType,
        beforeBalance: entry.beforeBalance,
        afterBalance: entry.afterBalance,
        referenceType: entry.referenceType,
        referenceId: objectIdSchema.parse(entry.referenceId),
        eventId: toObjectId(entry.eventId),
        paymentId: toObjectId(entry.paymentId),
        refundId: toObjectId(entry.refundId),
        payoutId: toObjectId(entry.payoutId),
        description: entry.description,
        metadata: entry.metadata ?? {},
        createdBy: toObjectId(entry.createdBy),
      };
    });

    return LedgerRepository.createEntries(prepared, session);
  }
}

export default LedgerEntryService;
