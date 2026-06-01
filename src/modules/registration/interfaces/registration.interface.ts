import { RegistrationStatus, RegistrationType } from '../constants/registration.constants';

export interface RegistrationPricing {
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  currency: string;
}

export interface RegistrationGroupInfo {
  groupName?: string;
  totalMembers: number;
}

export interface RegistrationCoupon {
  code: string;
  discountAmount: number;
}

export interface RegistrationBase {
  eventId: string;
  ticketId: string;
  registrationId?: string;
  participantsCount: number;
  status: RegistrationStatus;
  pricing: RegistrationPricing;
  coupon?: RegistrationCoupon;
  groupInfo?: RegistrationGroupInfo;
  paymentId?: string;
  registrationType?: RegistrationType;
}
