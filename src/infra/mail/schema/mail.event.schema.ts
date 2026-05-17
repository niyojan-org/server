import z from 'zod';

/**
 * Event Email Schemas
 * Validation schemas for all event-related email templates
 */

// Registration Confirmed Schema
export const registrationConfirmedSchema = z.object({
  name: z.string().min(1),
  eventName: z.string().min(1),
  eventDate: z.string().min(1),
  eventTime: z.string().min(1),
  eventLocation: z.string().min(1),
  registrationId: z.string().min(1),
  eventUrl: z.string().optional(),
  eventDescription: z.string().optional(),
  organizerName: z.string().optional(),
  organizerEmail: z.string().optional(),
  icsAttachment: z.any().optional(),
});

// Payment Pending Schema
export const paymentPendingSchema = z.object({
  name: z.string().min(1),
  eventName: z.string().min(1),
  eventDate: z.string().min(1),
  ticketPrice: z.number().positive(),
  reservationId: z.string().min(1),
  paymentUrl: z.string(),
  expiryTime: z.string().min(1),
  eventUrl: z.string().optional(),
  ticketType: z.string().optional(),
  quantity: z.number().positive().optional(),
});

// Ticket Purchase Schema
export const ticketPurchaseSchema = z.object({
  name: z.string().min(1),
  eventName: z.string().min(1),
  eventDate: z.string().min(1),
  eventTime: z.string().min(1),
  eventLocation: z.string().min(1),
  ticketId: z.string().min(1),
  qrCode: z.string().min(1),
  bookingId: z.string().optional(),
  ticketType: z.string().optional(),
  seatNumber: z.string().optional(),
  ticketUrl: z.string().optional(),
  eventUrl: z.string().optional(),
  icsAttachment: z.any().optional(),
  orderAmount: z.number().positive().optional(),
  transactionId: z.string().optional(),
});

// Reminder 24h Schema
export const reminder24hSchema = z.object({
  name: z.string().min(1),
  eventName: z.string().min(1),
  eventDate: z.string().min(1),
  eventTime: z.string().min(1),
  eventLocation: z.string().min(1),
  eventUrl: z.string().optional(),
  ticketUrl: z.string().optional(),
  qrCode: z.string().optional(),
  directions: z.string().optional(),
  parkingInfo: z.string().optional(),
  checkInTime: z.string().optional(),
  icsAttachment: z.any().optional(),
});

// Reminder 1h Schema
export const reminder1hSchema = z.object({
  name: z.string().min(1),
  eventName: z.string().min(1),
  eventTime: z.string().min(1),
  eventLocation: z.string().min(1),
  eventUrl: z.string().optional(),
  ticketUrl: z.string().optional(),
  qrCode: z.string().optional(),
  liveStreamUrl: z.string().optional(),
  checkInUrl: z.string().optional(),
});

// Event Cancelled Schema
export const eventCancelledSchema = z.object({
  name: z.string().min(1),
  eventName: z.string().min(1),
  eventDate: z.string().min(1),
  cancellationReason: z.string().min(1),
  refundAmount: z.number().positive().optional(),
  refundDate: z.string().optional(),
  refundMethod: z.string().optional(),
  supportUrl: z.string().optional(),
  supportEmail: z.string().optional(),
});

// Event Rescheduled Schema
export const eventRescheduledSchema = z.object({
  name: z.string().min(1),
  eventName: z.string().min(1),
  oldDate: z.string().min(1),
  oldTime: z.string().min(1),
  newDate: z.string().min(1),
  newTime: z.string().min(1),
  oldLocation: z.string().optional(),
  newLocation: z.string().optional(),
  eventUrl: z.string().optional(),
  reason: z.string().optional(),
  icsAttachment: z.any().optional(),
});

// Event Announcement Schema
export const eventAnnouncementSchema = z.object({
  name: z.string().min(1),
  eventName: z.string().min(1),
  announcementTitle: z.string().min(1),
  announcementBody: z.string().min(1),
  eventDate: z.string().optional(),
  eventTime: z.string().optional(),
  eventUrl: z.string().optional(),
  attachmentUrl: z.string().optional(),
  speakerInfo: z.string().optional(),
  agendaUpdate: z.string().optional(),
  venueMap: z.string().optional(),
  parkingInfo: z.string().optional(),
  registrationId: z.string().optional(),
});

// Join Link Schema (Virtual Events)
export const joinLinkSchema = z.object({
  name: z.string().min(1),
  eventName: z.string().min(1),
  eventDate: z.string().min(1),
  eventTime: z.string().min(1),
  joinUrl: z.string().min(1),
  meetingId: z.string().optional(),
  passcode: z.string().optional(),
  dialInNumber: z.string().optional(),
  eventUrl: z.string().optional(),
  icsAttachment: z.any().optional(),
  instructions: z.string().optional(),
});

// Ticket Resend Schema
export const ticketResendSchema = z.object({
  name: z.string().min(1),
  eventName: z.string().min(1),
  eventDate: z.string().min(1),
  eventTime: z.string().min(1),
  eventLocation: z.string().min(1),
  ticketId: z.string().min(1),
  qrCode: z.string().min(1),
  bookingId: z.string().optional(),
  ticketType: z.string().optional(),
  seatNumber: z.string().optional(),
  ticketUrl: z.string().optional(),
  eventUrl: z.string().optional(),
  icsAttachment: z.any().optional(),
});
