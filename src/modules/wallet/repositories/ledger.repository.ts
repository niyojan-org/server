import { ClientSession } from 'mongoose';

import { ILedgerEntry, LedgerEntryDocument, LedgerEntryModel } from '../schemas/ledger-entry.schema';

import { ObjectId } from '@helpers/zod';
import { LedgerPaginationQuery } from '../types/ledger-pagination.types';
import { buildPaginationQuery } from '../helper/ledger-pagination.helper';

class LedgerRepository {
  static async createEntry(data: Partial<ILedgerEntry>, session?: ClientSession): Promise<LedgerEntryDocument> {
    const entry = new LedgerEntryModel(data);
    return await entry.save({ session });
  }
  static async createEntries(data: Partial<ILedgerEntry>[], session?: ClientSession): Promise<LedgerEntryDocument[]> {
    return LedgerEntryModel.insertMany(data, { session });
  }
  static async findById(id: ObjectId | string): Promise<LedgerEntryDocument | null> {
    return await LedgerEntryModel.findById(id);
  }
  static async findByReference(
    referenceType: ILedgerEntry['referenceType'],
    referenceId: ObjectId | string,
  ): Promise<LedgerEntryDocument[]> {
    return await LedgerEntryModel.find({
      referenceType,
      referenceId,
    }).sort({
      createdAt: -1,
    });
  }

  static async findLatestWalletEntry(walletId: ObjectId | string): Promise<LedgerEntryDocument | null> {
    return await LedgerEntryModel.findOne({
      walletId,
    }).sort({
      createdAt: -1,
    });
  }

  static async paginateEntries(query: LedgerPaginationQuery) {
    const builtQuery = buildPaginationQuery(query);
    return await LedgerEntryModel.paginate(builtQuery.filters, {
      page: builtQuery.page,
      limit: builtQuery.limit,
      sort: {
        createdAt: -1,
      },
      lean: true,
    });
  }

  static async existsByReference(
    referenceType: ILedgerEntry['referenceType'],
    referenceId: ObjectId | string,
    category?: ILedgerEntry['category'],
  ): Promise<boolean> {
    const existing = await LedgerEntryModel.exists({
      referenceType,
      referenceId,
      ...(category && { category }),
    });

    return !!existing;
  }
  static async getWalletBalanceSummary(walletId: ObjectId | string) {
    return await LedgerEntryModel.aggregate([
      { $match: { walletId } },
      {
        $group: {
          _id: { balanceType: '$balanceType', type: '$type' },
          totalAmount: { $sum: '$amount' },
        },
      },
    ]);
  }
  static async getCategorySummary(organizationId: ObjectId | string) {
    return await LedgerEntryModel.aggregate([
      { $match: { organizationId } },
      {
        $group: {
          _id: '$category',
          totalAmount: { $sum: '$amount' },
          totalEntries: { $sum: 1 },
        },
      },
    ]);
  }
}

export default LedgerRepository;
