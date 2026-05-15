import ApiError from '@core/errors/api.error';
import PaymentRepository from '../repositories/payment.repository';
import PaymentOrderRepository from '../repositories/payment-order.repository';
import PaymentFeeService from './payment-fee.service';
import PaymentFeeConfigService from './payment-fee-config.service';
import WalletCreateService from '@modules/wallet/services/wallet.create.service';
import WalletAccountingService from '@modules/wallet/services/wallet.accounting.service';
import LedgerRepository from '@modules/wallet/repositories/ledger.repository';
import {
  LedgerBalanceType,
  LedgerCategory,
  LedgerEntryType,
  LedgerReferenceType,
} from '@modules/wallet/types/ledger.enums';
import { FeeConfig } from '../types/payment-fee.types';
import { PaymentStatus } from '../types/payment.enums';
import { PaymentOrderStatus } from '../types/payment-order.enums';
import { ObjectId } from '@helpers/zod';

export interface PaymentCapturePayload {
  paymentId?: string;
  gatewayPaymentId?: string;
  gatewayPayload?: Record<string, unknown>;
  feeConfig?: FeeConfig;
}

export interface PaymentRefundPayload {
  paymentId: ObjectId | string;
  amount?: number;
  balanceType?: LedgerBalanceType;
  reason?: string;
}

class PaymentOrchestratorService {
  static async processPaymentCaptured(payload: PaymentCapturePayload) {
    const payment = payload.paymentId
      ? await PaymentRepository.findById(payload.paymentId)
      : payload.gatewayPaymentId
        ? await PaymentRepository.findByGatewayPaymentId(
            payload.gatewayPaymentId,
          )
        : null;

    if (!payment) {
      throw new ApiError(404, 'Payment not found', 'PAYMENT_NOT_FOUND');
    }

    if (payment.status === PaymentStatus.SUCCESS) {
      return payment;
    }

    await WalletCreateService.create(payment.organizationId);

    const alreadyCredited = await LedgerRepository.existsByReference(
      LedgerReferenceType.PAYMENT,
      payment._id,
      LedgerCategory.EVENT_PAYMENT_HOLD,
    );

    if (alreadyCredited) {
      return payment;
    }

    if (payload.gatewayPaymentId && !payment.gatewayPaymentId) {
      await PaymentRepository.updateGatewayPaymentId(
        payment._id,
        payload.gatewayPaymentId,
      );
    }

    const persistedConfig = await PaymentFeeConfigService.getActiveConfig(
      payment.organizationId.toString(),
      payment.gateway,
    );
    const feeConfig =
      payload.feeConfig ??
      persistedConfig ??
      (payment.metadata?.feeConfig as FeeConfig | undefined);
    const fees = PaymentFeeService.calculate(payment.amount, feeConfig);

    const entries = [
      {
        type: LedgerEntryType.CREDIT,
        category: LedgerCategory.EVENT_PAYMENT_HOLD,
        amount: payment.amount,
        balanceType: LedgerBalanceType.HOLD,
        referenceType: LedgerReferenceType.PAYMENT,
        referenceId: payment._id.toString(),
        eventId: payment.eventId.toString(),
        paymentId: payment._id.toString(),
        description: 'Payment captured and held for settlement',
      },
    ];

    if (fees.gatewayFee > 0) {
      entries.push({
        type: LedgerEntryType.DEBIT,
        category: LedgerCategory.PAYMENT_GATEWAY_FEE,
        amount: fees.gatewayFee,
        balanceType: LedgerBalanceType.HOLD,
        referenceType: LedgerReferenceType.PAYMENT,
        referenceId: payment._id.toString(),
        eventId: payment.eventId.toString(),
        paymentId: payment._id.toString(),
        description: 'Gateway fee deducted from hold balance',
      });
    }

    if (fees.platformFee > 0) {
      entries.push({
        type: LedgerEntryType.DEBIT,
        category: LedgerCategory.PLATFORM_FEE,
        amount: fees.platformFee,
        balanceType: LedgerBalanceType.HOLD,
        referenceType: LedgerReferenceType.PAYMENT,
        referenceId: payment._id.toString(),
        eventId: payment.eventId.toString(),
        paymentId: payment._id.toString(),
        description: 'Platform fee deducted from hold balance',
      });
    }

    if (fees.tax > 0) {
      entries.push({
        type: LedgerEntryType.DEBIT,
        category: LedgerCategory.TAX_DEDUCTION,
        amount: fees.tax,
        balanceType: LedgerBalanceType.HOLD,
        referenceType: LedgerReferenceType.PAYMENT,
        referenceId: payment._id.toString(),
        eventId: payment.eventId.toString(),
        paymentId: payment._id.toString(),
        description: 'Tax deducted from hold balance',
      });
    }

    await WalletAccountingService.applyEntries({
      organizationId: payment.organizationId.toString(),
      entries,
      extraIncrements: {
        totalEarning: payment.amount,
      },
    });

    await PaymentRepository.updateRawGatewayResponse(
      payment._id,
      payload.gatewayPayload ?? {},
    );

    await PaymentRepository.markCaptured(payment._id, new Date());
    await PaymentOrderRepository.updateStatus(
      payment.paymentOrderId,
      PaymentOrderStatus.PAID,
    );

    return payment;
  }

  static async processPaymentFailed(paymentId: string, reason?: string) {
    const payment = await PaymentRepository.findById(paymentId);
    if (!payment) {
      throw new ApiError(404, 'Payment not found', 'PAYMENT_NOT_FOUND');
    }

    await PaymentRepository.markFailed(paymentId, new Date());
    await PaymentOrderRepository.markFailed(
      payment.paymentOrderId,
      new Date(),
      reason,
    );

    return payment;
  }

  static async processRefund(payload: PaymentRefundPayload) {
    const payment = await PaymentRepository.findById(payload.paymentId);
    if (!payment) {
      throw new ApiError(404, 'Payment not found', 'PAYMENT_NOT_FOUND');
    }

    const refundAmount = payload.amount ?? payment.amount;
    const debitBalanceType = payload.balanceType ?? LedgerBalanceType.HOLD;

    await WalletAccountingService.applyEntries({
      organizationId: payment.organizationId.toString(),
      entries: [
        {
          type: LedgerEntryType.DEBIT,
          category: LedgerCategory.REFUND,
          amount: refundAmount,
          balanceType: debitBalanceType,
          referenceType: LedgerReferenceType.REFUND,
          referenceId: payment._id.toString(),
          eventId: payment.eventId.toString(),
          paymentId: payment._id.toString(),
          description: payload.reason ?? 'Refund processed',
        },
        {
          type: LedgerEntryType.CREDIT,
          category: LedgerCategory.REFUND,
          amount: refundAmount,
          balanceType: LedgerBalanceType.REFUNDED,
          referenceType: LedgerReferenceType.REFUND,
          referenceId: payment._id.toString(),
          eventId: payment.eventId.toString(),
          paymentId: payment._id.toString(),
          description: 'Refund recorded in wallet totals',
        },
      ],
      extraIncrements: {
        refundedBalance: refundAmount,
      },
    });

    await PaymentRepository.markRefunded(payment._id, new Date());

    return payment;
  }
}

export default PaymentOrchestratorService;
