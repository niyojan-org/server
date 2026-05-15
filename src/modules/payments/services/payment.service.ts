import crypto from 'crypto';
import mongoose from 'mongoose';
import ApiError from '@core/errors/api.error';
import { PaymentGateway, PaymentStatus } from '../types/payment.enums';
import { PaymentOrderStatus } from '../types/payment-order.enums';
import PaymentRepository from '../repositories/payment.repository';
import PaymentOrderRepository from '../repositories/payment-order.repository';
import RazorpayClient from '../gateway/razorpay/razorpay.client';
import PhonePeClient from '../gateway/phonepe/phonepe.client';
import { IPaymentOrder } from '../schemas/payment-order.schema';
import { IPayment } from '../schemas/payment.schema';
import { ObjectId, objectIdSchema } from '@helpers/zod';

export interface CreatePaymentOrderPayload {
  registrationId: ObjectId | string;
  organizationId: ObjectId | string;
  eventId: ObjectId | string;
  amount: number;
  currency?: string;
  gateway: PaymentGateway;
  metadata?: Record<string, unknown>;
}

class PaymentService {
  static async createPaymentOrder(payload: CreatePaymentOrderPayload) {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const paymentOrderReference = `PO-${Date.now()}-${crypto.randomUUID()}`;
      const paymentReference = `PM-${Date.now()}-${crypto.randomUUID()}`;
      const currency = payload.currency ?? 'INR';

      let gatewayOrderId = paymentOrderReference;
      let gatewayOrderPayload: Record<string, unknown> = {};

      const registrationId = objectIdSchema.parse(payload.registrationId);
      const organizationId = objectIdSchema.parse(payload.organizationId);
      const eventId = objectIdSchema.parse(payload.eventId);

      if (payload.gateway === PaymentGateway.RAZORPAY) {
        const gatewayOrder = await RazorpayClient.createOrder({
          amount: payload.amount,
          currency,
          receipt: paymentOrderReference,
        });
        gatewayOrderId = gatewayOrder.id;
        gatewayOrderPayload = gatewayOrder as unknown as Record<string, unknown>;
      }

      if (payload.gateway === PaymentGateway.PHONEPE) {
        gatewayOrderId = paymentReference;
        const phonepeOrder = await PhonePeClient.initiatePayment({
          amount: payload.amount,
          merchantTransactionId: paymentReference,
          merchantUserId: registrationId.toString(),
          callbackUrl: payload.metadata?.callbackUrl as string | undefined,
          redirectUrl: payload.metadata?.redirectUrl as string | undefined,
          paymentInstrument: payload.metadata?.paymentInstrument as
            | Record<string, unknown>
            | undefined,
        });
        gatewayOrderPayload = phonepeOrder as unknown as Record<string, unknown>;
      }

      const paymentOrderData: Partial<IPaymentOrder> = {
        registrationId,
        organizationId,
        eventId,
        gateway: payload.gateway,
        gatewayOrderId,
        paymentOrderReference,
        amount: payload.amount,
        currency,
        status: PaymentOrderStatus.CREATED,
        metadata: payload.metadata,
        gatewayOrderPayload,
      };

      const paymentOrder = await PaymentOrderRepository.createPaymentOrder(
        paymentOrderData,
        session,
      );

      const paymentData: Partial<IPayment> = {
        paymentOrderId: paymentOrder._id,
        eventId,
        organizationId,
        registrationId,
        gateway: payload.gateway,
        gatewayOrderId,
        amount: payload.amount,
        currency,
        paymentReference,
        status: PaymentStatus.PENDING,
        metadata: payload.metadata,
      };

      const payment = await PaymentRepository.createPayment(paymentData, session);

      await session.commitTransaction();

      return { paymentOrder, payment };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  static async getPaymentById(paymentId: ObjectId | string) {
    const payment = await PaymentRepository.findById(paymentId);
    if (!payment) {
      throw new ApiError(404, 'Payment not found', 'PAYMENT_NOT_FOUND');
    }
    return payment;
  }
}

export default PaymentService;
