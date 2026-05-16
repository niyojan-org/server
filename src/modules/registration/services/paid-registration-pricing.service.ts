import { RegistrationPricing } from '../interfaces/registration.interface';

export interface PaidRegistrationPricingInput {
  ticketPrice: number;
  participantsCount: number;
  discountAmount?: number;
  taxPercentage?: number;
  currency?: string;
}

export class PaidRegistrationPricingService {
  /**
   * Calculate pricing for a paid registration
   * @param input Pricing calculation inputs
   * @returns Calculated pricing snapshot
   */
  static calculatePaidRegistrationPricing(
    input: PaidRegistrationPricingInput,
  ): RegistrationPricing {
    const ticketPrice = Math.max(0, input.ticketPrice || 0);
    const participantsCount = Math.max(1, input.participantsCount || 1);
    const discountAmount = Math.max(0, input.discountAmount || 0);
    const taxPercentage = Math.max(0, input.taxPercentage || 0);
    const currency = input.currency || 'INR';

    // Calculate subtotal
    const subtotal = ticketPrice * participantsCount;

    // Apply discount
    const discount = Math.min(discountAmount, subtotal);

    // Calculate amount after discount
    const amountAfterDiscount = subtotal - discount;

    // Calculate tax on amount after discount
    const tax = Math.round(amountAfterDiscount * (taxPercentage / 100));

    // Calculate total
    const total = amountAfterDiscount + tax;

    return {
      subtotal,
      discount,
      tax,
      total,
      currency,
    };
  }
}
