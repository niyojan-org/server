import mongoose from 'mongoose';
import { ObjectId, objectIdSchema, toObjectId } from '@helpers/zod';
import PaymentFeeConfigRepository from '../repositories/payment-fee-config.repository';
import { PaymentGateway } from '../types/payment.enums';
import { FeeConfig } from '../types/payment-fee.types';

export interface UpsertFeeConfigPayload extends FeeConfig {
  organizationId: ObjectId | string;
  gateway: PaymentGateway;
  createdBy?: ObjectId | string;
}

class PaymentFeeConfigService {
  static async upsertConfig(payload: UpsertFeeConfigPayload) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      await PaymentFeeConfigRepository.deactivateConfigs(
        payload.organizationId,
        payload.gateway,
        session,
      );

      const config = await PaymentFeeConfigRepository.createConfig(
        {
          organizationId: objectIdSchema.parse(payload.organizationId),
          gateway: payload.gateway,
          platformFeePercent: payload.platformFeePercent,
          platformFeeFlat: payload.platformFeeFlat,
          gatewayFeePercent: payload.gatewayFeePercent,
          gatewayFeeFlat: payload.gatewayFeeFlat,
          taxPercent: payload.taxPercent,
          taxFlat: payload.taxFlat,
          active: true,
          createdBy: toObjectId(payload.createdBy),
        },
        session,
      );

      await session.commitTransaction();
      return config;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  static async getActiveConfig(
    organizationId: ObjectId | string,
    gateway: PaymentGateway,
  ) {
    return PaymentFeeConfigRepository.findActiveConfig(organizationId, gateway);
  }

  static async listConfigs(organizationId: ObjectId | string) {
    return PaymentFeeConfigRepository.listConfigs(organizationId);
  }
}

export default PaymentFeeConfigService;
