import { IWallet, WalletDocument, WalletModel } from '../schemas/wallet.schema';
import { ObjectId } from '@helpers/zod';
import { WalletBalanceType } from '../types/wallet.enums';
import { ClientSession } from 'mongoose';
import ApiError from '@core/errors/api.error';

class WalletRepository {
  //create
  static async createWallet(
    organizationId: ObjectId | string,
  ): Promise<WalletDocument> {
    const wallet = new WalletModel({ organizationId });
    return await wallet.save();
  }

  //read
  static async findWalletByOrganizationId(
    id: ObjectId | string,
  ): Promise<IWallet | null> {
    return await WalletModel.findOne({ organizationId: id }).lean();
  }
  static async findById(id: ObjectId | string): Promise<IWallet | null> {
    return await WalletModel.findById(id).lean();
  }

  //update
  static async updateWallet(
    walletId: ObjectId | string,
    updateData: Partial<IWallet>,
  ) {
    return await WalletModel.findByIdAndUpdate(walletId, updateData, {
      new: true,
    });
  }
  static async updateWalletForOrganization(
    organizationId: ObjectId | string,
    updateData: Partial<IWallet>,
  ) {
    return await WalletModel.findOneAndUpdate({ organizationId }, updateData, {
      new: true,
    });
  }
  static async updateLastLedgerEntry(
    walletId: ObjectId | string,
    ledgerEntryId: ObjectId | string,
    session?: ClientSession,
  ) {
    return await WalletModel.findByIdAndUpdate(
      walletId,
      { lastLedgerEntryId: ledgerEntryId },
      { new: true, session },
    );
  }

  //balance
  static async updateBalance(
    walletId: ObjectId | string,
    balanceType: WalletBalanceType,
    amount: number,
    session?: ClientSession,
  ): Promise<WalletDocument | null> {
    return WalletModel.findByIdAndUpdate(
      walletId,
      { $inc: { [balanceType]: amount } },
      { new: true, session },
    );
  }
  static async transferBalance(
    walletId: ObjectId | string,
    from: WalletBalanceType,
    to: WalletBalanceType,
    amount: number,
    session?: ClientSession,
  ): Promise<WalletDocument | null> {
    const updatedWallet = await WalletModel.findOneAndUpdate(
      { _id: walletId, [from]: { $gte: amount } },
      { $inc: { [from]: -amount, [to]: amount } },
      { new: true, session },
    );

    if (!updatedWallet) {
      throw new ApiError(
        400,
        'Insufficient wallet balance',
        'INSUFFICIENT_WALLET_BALANCE',
        `Wallet ${walletId} has insufficient ${from} balance`,
      );
    }

    return updatedWallet;
  }

  //freeze
  static async freezeWallet(
    walletId: ObjectId | string,
    reason: string,
  ): Promise<void> {
    await WalletModel.findByIdAndUpdate(walletId, {
      isFrozen: true,
      freezeReason: reason,
    });
  }
  static async unfreezeWallet(walletId: ObjectId | string): Promise<void> {
    await WalletModel.findByIdAndUpdate(walletId, {
      isFrozen: false,
      freezeReason: null,
    });
  }
}

export default WalletRepository;
