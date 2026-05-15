import { FeeBreakdown, FeeConfig } from '../types/payment-fee.types';

const toMinorAmount = (value?: number) => Math.max(0, Math.round(value ?? 0));

class PaymentFeeService {
  static calculate(amount: number, config?: FeeConfig): FeeBreakdown {
    const platformFee =
      Math.round((amount * (config?.platformFeePercent ?? 0)) / 100) +
      toMinorAmount(config?.platformFeeFlat);
    const gatewayFee =
      Math.round((amount * (config?.gatewayFeePercent ?? 0)) / 100) +
      toMinorAmount(config?.gatewayFeeFlat);
    const tax =
      Math.round((amount * (config?.taxPercent ?? 0)) / 100) +
      toMinorAmount(config?.taxFlat);

    return {
      platformFee: Math.max(0, platformFee),
      gatewayFee: Math.max(0, gatewayFee),
      tax: Math.max(0, tax),
    };
  }
}

export default PaymentFeeService;
