import { PaymentGateway } from '@modules/payments/types/payment.enums';
import { CreateRegistrationDto } from './create-registration.dto';

export interface PaidRegistrationDto extends CreateRegistrationDto {
  paymentGateway: PaymentGateway;
  paymentMetadata?: Record<string, unknown>;
}
