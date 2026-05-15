import { ClientSession } from 'mongoose';
import { ObjectId } from '@helpers/zod';
import { IPayout, PayoutDocument, PayoutModel } from '../schemas/payout.schema';
import { PayoutStatus } from '../types/payout.enums';

class PayoutRepository {
  static async createPayout(
    data: Partial<IPayout>,
    session?: ClientSession,
  ): Promise<PayoutDocument> {
    const payout = new PayoutModel(data);
    return payout.save({ session });
  }

  static async findById(id: ObjectId | string) {
    return PayoutModel.findById(id);
  }

  static async findByReference(reference: string) {
    return PayoutModel.findOne({ reference });
  }

  static async updateStatus(
    id: ObjectId | string,
    status: PayoutStatus,
    updates?: Partial<IPayout>,
    session?: ClientSession,
  ) {
    return PayoutModel.findByIdAndUpdate(
      id,
      { status, ...updates },
      { new: true, session },
    );
  }
}

export default PayoutRepository;
