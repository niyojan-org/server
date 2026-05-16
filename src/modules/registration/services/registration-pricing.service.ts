import { RegistrationPricing } from '../interfaces/registration.interface';

export class RegistrationPricingService {
  static calculateFreeRegistrationPricing(): RegistrationPricing {
    return {
      subtotal: 0,
      discount: 0,
      tax: 0,
      total: 0,
      currency: 'INR',
    };
  }
}
