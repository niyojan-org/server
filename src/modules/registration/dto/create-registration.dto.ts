export interface CreateRegistrationDto {
  eventId: string;
  ticketId: string;
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
