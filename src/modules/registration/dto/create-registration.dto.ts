import { PaymentGateway } from '@modules/payments/types/payment.enums';
import mongoose from 'mongoose';
import { array, email, nativeEnum, object, record, string, unknown } from 'zod';

export interface CreateRegistrationDto {
  eventId: mongoose.Types.ObjectId;
  ticketId: mongoose.Types.ObjectId;
  participants: Array<{
    name: string;
    email: string;
    phone: string;
    dynamicFields?: Record<string, unknown>;
  }>;
  groupInfo?: {
    groupName?: string;
  };
  couponCode?: string;
  referralCode?: string;
}

export const createRegistrationSchema = object({
  eventId: string({ message: 'Event ID or slug is required' })
    .min(1, 'Event ID or slug cannot be empty')
    .max(50, 'Event ID or slug is too long'),
  ticketId: string({ message: 'Ticket ID is required' })
    .min(1, 'Ticket ID cannot be empty')
    .max(20, 'Ticket ID is too long'),
  participants: array(
    object({
      name: string({ message: 'Participant name is required' })
        .min(1, 'Participant name cannot be empty')
        .max(100, 'Participant name is too long'),
      email: email({ message: 'Invalid email address' })
        .min(1, 'Email is required')
        .max(100, 'Email is too long'),
      phone: string({ message: 'Phone number is required' })
        .min(10, 'Phone number cannot be empty')
        .max(15, 'Phone number is too long'),
      dynamicFields: record(string(), unknown()).optional(),
    }),
    { message: 'Participants must be an array of participant objects' },
  )
    .min(1, 'At least one participant is required')
    .max(30, 'Too many participants, maximum is 30'),
  groupInfo: object({
    groupName: string({ message: 'Group name is required' })
      .min(1, 'Group name cannot be empty')
      .max(50, 'Group name is too long')
      .optional(),
  }).optional(),
  couponCode: string({ message: 'Coupon code must be a valid string' })
    .min(2, 'Coupon code is too short')
    .max(20, 'Coupon code is too long')
    .uppercase({ message: 'Coupon code must be in uppercase' })
    .optional(),
  referralCode: string({ message: 'Referral code must be a valid string' })
    .min(2, 'Referral code is too short')
    .max(20, 'Referral code is too long')
    .optional(),
  // Optional for paid registrations
  paymentGateway: nativeEnum(PaymentGateway, {
    message: `Payment gateway must be one of: ${Object.values(PaymentGateway).join(', ')}`,
  }).optional(),
  paymentMetadata: record(string(), unknown(), {
    message: 'Invalid payment metadata',
  }).optional(),
  organizationId: string().optional(),
});
