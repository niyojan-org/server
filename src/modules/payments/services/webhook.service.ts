import ApiError from '@core/errors/api.error';
import { PaymentGateway } from '../types/payment.enums';
import { WebhookEventStatus } from '../types/webhook-event.enums';
import WebhookEventRepository from '../repositories/webhook-event.repository';
import PaymentOrchestratorService from './payment-orchestrator.service';
import PaymentRepository from '../repositories/payment.repository';
import { verifyRazorpayWebhook } from '../gateway/razorpay/razorpay.webhook';
import { verifyPhonePeWebhook } from '../gateway/phonepe/phonepe.webhook';

type RazorpayPayload = {
  payload?: {
    payment?: { entity?: { id?: string } };
    refund?: {
      entity?: {
        payment_id?: string;
        amount?: number;
        notes?: { reason?: string };
      };
    };
  };
};

type PhonePePayload = {
  data?: {
    merchantTransactionId?: string;
    transactionId?: string;
    merchantOrderId?: string;
    amount?: number;
    message?: string;
  };
};

export interface WebhookPayload {
  gateway: PaymentGateway;
  rawBody: string;
  signature?: string;
  payload: Record<string, unknown>;
  headers?: Record<string, unknown>;
}

class WebhookService {
  static async handleGatewayWebhook({
    gateway,
    rawBody,
    signature,
    payload,
    headers,
  }: WebhookPayload) {
    if (gateway === PaymentGateway.RAZORPAY) {
      if (!signature) {
        throw new ApiError(400, 'Missing webhook signature', 'SIGNATURE_REQUIRED');
      }
      const isValid = verifyRazorpayWebhook(rawBody, signature);
      if (!isValid) {
        throw new ApiError(401, 'Invalid webhook signature', 'INVALID_SIGNATURE');
      }
    }

    if (gateway === PaymentGateway.PHONEPE) {
      if (!signature) {
        throw new ApiError(400, 'Missing webhook signature', 'SIGNATURE_REQUIRED');
      }
      const isValid = verifyPhonePeWebhook(rawBody, signature);
      if (!isValid) {
        throw new ApiError(401, 'Invalid webhook signature', 'INVALID_SIGNATURE');
      }
    }

    const eventType =
      (payload.event as string) ??
      (payload.code as string) ??
      (payload.type as string) ??
      'unknown';
    const razorpayPayload = payload as RazorpayPayload;
    const gatewayEventId =
      (payload.id as string) ??
      (payload.event_id as string) ??
      razorpayPayload.payload?.payment?.entity?.id ??
      undefined;

    const event = await WebhookEventRepository.createEvent({
      gateway,
      eventType,
      gatewayEventId,
      signature,
      payload,
      headers,
      status: WebhookEventStatus.PROCESSING,
    });

    try {
      if (gateway === PaymentGateway.RAZORPAY) {
        await WebhookService.processRazorpayEvent(eventType, payload);
      }

      if (gateway === PaymentGateway.PHONEPE) {
        await WebhookService.processPhonePeEvent(eventType, payload);
      }

      await WebhookEventRepository.updateStatus(
        event._id,
        WebhookEventStatus.SUCCESS,
        { processedAt: new Date() },
      );
    } catch (error) {
      await WebhookEventRepository.updateStatus(
        event._id,
        WebhookEventStatus.FAILED,
        {
          failedAt: new Date(),
          failureReason: error instanceof Error ? error.message : 'Unknown error',
        },
      );
      throw error;
    }

    return event;
  }

  private static async processRazorpayEvent(
    eventType: string,
    payload: Record<string, unknown>,
  ) {
    const razorpayPayload = payload as RazorpayPayload;
    if (eventType === 'payment.captured') {
      const gatewayPaymentId = razorpayPayload.payload?.payment?.entity?.id;
      await PaymentOrchestratorService.processPaymentCaptured({
        gatewayPaymentId,
        gatewayPayload: payload,
      });
      return;
    }

    if (eventType === 'payment.failed') {
      const gatewayPaymentId = razorpayPayload.payload?.payment?.entity?.id;
      if (!gatewayPaymentId) {
        throw new ApiError(400, 'Missing payment id', 'MISSING_PAYMENT_ID');
      }
      const payment = await PaymentRepository.findByGatewayPaymentId(
        gatewayPaymentId,
      );
      if (!payment) {
        throw new ApiError(404, 'Payment not found', 'PAYMENT_NOT_FOUND');
      }
      await PaymentOrchestratorService.processPaymentFailed(
        payment._id.toString(),
        'Gateway reported failure',
      );
      return;
    }

    if (eventType === 'refund.processed') {
      const refundEntity = razorpayPayload.payload?.refund?.entity;
      const gatewayPaymentId = refundEntity?.payment_id as string | undefined;
      if (!gatewayPaymentId) {
        throw new ApiError(400, 'Missing payment id', 'MISSING_PAYMENT_ID');
      }
      const payment = await PaymentRepository.findByGatewayPaymentId(
        gatewayPaymentId,
      );
      if (!payment) {
        throw new ApiError(404, 'Payment not found', 'PAYMENT_NOT_FOUND');
      }
      await PaymentOrchestratorService.processRefund({
        paymentId: payment._id.toString(),
        amount: refundEntity?.amount,
        reason: refundEntity?.notes?.reason,
      });
    }
  }

  private static async processPhonePeEvent(
    eventType: string,
    payload: Record<string, unknown>,
  ) {
    const normalized = eventType?.toUpperCase?.() ?? '';
    const data = (payload as PhonePePayload).data ?? {};
    const reference =
      data?.merchantTransactionId ||
      data?.transactionId ||
      data?.merchantOrderId;

    if (!reference) {
      throw new ApiError(400, 'Missing transaction reference', 'MISSING_REFERENCE');
    }

    const payment =
      (await PaymentRepository.findByGatewayOrderId(reference)) ??
      (await PaymentRepository.findByPaymentReference(reference));

    if (!payment) {
      throw new ApiError(404, 'Payment not found', 'PAYMENT_NOT_FOUND');
    }

    if (
      normalized.includes('SUCCESS') ||
      normalized.includes('CAPTURE') ||
      normalized.includes('COMPLETED')
    ) {
      await PaymentOrchestratorService.processPaymentCaptured({
        paymentId: payment._id.toString(),
        gatewayPayload: payload,
      });
      return;
    }

    if (normalized.includes('FAILED')) {
      await PaymentOrchestratorService.processPaymentFailed(
        payment._id.toString(),
        'Gateway reported failure',
      );
      return;
    }

    if (normalized.includes('REFUND')) {
      await PaymentOrchestratorService.processRefund({
        paymentId: payment._id.toString(),
        amount: data?.amount,
        reason: data?.message,
      });
    }
  }
}

export default WebhookService;
