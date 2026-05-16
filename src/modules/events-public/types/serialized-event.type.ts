export type PublicEventSession = {
  id?: string;
  title?: string;
  description?: string;
  startTime?: Date | string;
  endTime?: Date | string;
  venue?: {
    name?: string;
    locality?: string;
    city?: string;
    state: string;
    country: string;
    zipCode: string;
  };
  isActive?: boolean;
  allowCheckIn?: boolean;
  checkInStartTime?: Date | string;
  checkInEndTime?: Date | string;
  speakers?: string[];
};

export type PublicEventTicket = {
  id?: string;
  type?: string;
  price?: number;
  capacity?: number;
  salesStartTime?: Date | string;
  salesEndTime?: Date | string;
  isActive?: boolean;
  isGroupTicket?: boolean;
  groupSettings?: {
    minParticipants?: number;
    maxParticipants?: number;
    groupLeaderRequired?: boolean;
  };
};

export type PublicEventPayload = {
  id?: string;
  title?: string;
  description?: string;
  bannerImage?: string;
  banner?: string;
  tags?: string[];
  category?: string;
  mode?: string;
  visibility?: string;
  registrationStart?: Date | string;
  registrationEnd?: Date | string;
  allowMultipleSessions?: boolean;
  allowCoupons?: boolean;
  allowReferrals?: boolean;
  slug?: string;
  status?: string;
  isRegistrationOpen?: boolean;
  publishedAt?: Date | string;
  sessions?: PublicEventSession[];
  tickets?: PublicEventTicket[];
};
