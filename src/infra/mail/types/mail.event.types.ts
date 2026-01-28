import z from "zod";
import { EventSchema } from "../schema";

/**
 * Event Email Types
 * TypeScript types inferred from Zod schemas
 */

export type RegistrationConfirmedType = z.infer<typeof EventSchema.registrationConfirmedSchema>;
export type PaymentPendingType = z.infer<typeof EventSchema.paymentPendingSchema>;
export type TicketPurchaseType = z.infer<typeof EventSchema.ticketPurchaseSchema>;
export type Reminder24hType = z.infer<typeof EventSchema.reminder24hSchema>;
export type Reminder1hType = z.infer<typeof EventSchema.reminder1hSchema>;
export type EventCancelledType = z.infer<typeof EventSchema.eventCancelledSchema>;
export type EventRescheduledType = z.infer<typeof EventSchema.eventRescheduledSchema>;
export type EventAnnouncementType = z.infer<typeof EventSchema.eventAnnouncementSchema>;
export type JoinLinkType = z.infer<typeof EventSchema.joinLinkSchema>;
export type TicketResendType = z.infer<typeof EventSchema.ticketResendSchema>;
