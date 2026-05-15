import { ClientSession } from 'mongoose';
import { ObjectId } from '@helpers/zod';
import {
  IPaymentFeeConfig,
  PaymentFeeConfigDocument,
  PaymentFeeConfigModel,
} from '../schemas/payment-fee-config.schema';
import { PaymentGateway } from '../types/payment.enums';

class PaymentFeeConfigRepository {
  static async createConfig(
    data: Partial<IPaymentFeeConfig>,
    session?: ClientSession,
  ): Promise<PaymentFeeConfigDocument> {
    const config = new PaymentFeeConfigModel(data);
    return config.save({ session });
  }

  static async deactivateConfigs(
    organizationId: ObjectId | string,
    gateway: PaymentGateway,
    session?: ClientSession,
  ) {
    return PaymentFeeConfigModel.updateMany(
      { organizationId, gateway, active: true },
      { active: false },
      { session },
    );
  }

  static async findActiveConfig(
    organizationId: ObjectId | string,
    gateway: PaymentGateway,
  ) {
    return PaymentFeeConfigModel.findOne({ organizationId, gateway, active: true })
      .sort({ createdAt: -1 })
      .lean();
  }

  static async listConfigs(organizationId: ObjectId | string) {
    return PaymentFeeConfigModel.find({ organizationId }).sort({ createdAt: -1 }).lean();
  }
}

export default PaymentFeeConfigRepository;
