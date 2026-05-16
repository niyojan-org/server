import mongoose from 'mongoose';
import {
  RegistrationStatus,
  RegistrationType,
} from '../constants/registration.constants';

export type RegistrationSchema = {
  eventId: mongoose.Types.ObjectId;
  ticketId: mongoose.Types.ObjectId;
  participantIds: mongoose.Types.ObjectId[];
  participantsCount: number;
  status: RegistrationStatus;
  registrationType?: RegistrationType | null | undefined;
  pricing: {
    subtotal: number;
    discount: number;
    tax: number;
    total: number;
    currency: string;
  };
  coupon?: {
    code: string;
    discountAmount: number;
  };
  groupInfo?: {
    groupName?: string;
    totalMembers: number;
  };
  paymentId?: mongoose.Types.ObjectId;
};
