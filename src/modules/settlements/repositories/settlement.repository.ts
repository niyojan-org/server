import { ClientSession } from 'mongoose';
import { ObjectId } from '@helpers/zod';
import {
  ISettlement,
  SettlementDocument,
  SettlementModel,
} from '../schemas/settlement.schema';
import { SettlementStatus } from '../types/settlement.enums';

class SettlementRepository {
  static async createSettlement(
    data: Partial<ISettlement>,
    session?: ClientSession,
  ): Promise<SettlementDocument> {
    const settlement = new SettlementModel(data);
    return settlement.save({ session });
  }

  static async findById(id: ObjectId | string) {
    return SettlementModel.findById(id);
  }

  static async findByReference(reference: string) {
    return SettlementModel.findOne({ reference });
  }

  static async markReleased(
    id: ObjectId | string,
    releasedAt: Date,
    session?: ClientSession,
  ) {
    return SettlementModel.findByIdAndUpdate(
      id,
      { status: SettlementStatus.RELEASED, releasedAt },
      { new: true, session },
    );
  }

  static async markFailed(
    id: ObjectId | string,
    failedAt: Date,
    reason?: string,
    session?: ClientSession,
  ) {
    return SettlementModel.findByIdAndUpdate(
      id,
      { status: SettlementStatus.FAILED, failedAt, failureReason: reason },
      { new: true, session },
    );
  }
}

export default SettlementRepository;
