import z from 'zod';
import { TicketSchema } from '../core/event.zod';
import * as Schema from '../core/event.zod';
import mongoose from 'mongoose';

export type Event = z.infer<typeof Schema.EventSchema>;
export type EventBase = z.infer<typeof Schema.EventBaseSchema>;
export type CreateEventInput = z.infer<typeof Schema.CreateEventSchema>;
export type Session = z.infer<typeof Schema.SessionSchema>;
export type Ticket = z.infer<typeof Schema.TicketSchema>;
export type CustomField = z.infer<typeof Schema.CustomFieldSchema>;
export type Coupon = z.infer<typeof Schema.CouponSchema>;
export type GroupSettings = z.infer<typeof Schema.GroupSettingsSchema>;
export type EventGovernance = z.infer<typeof Schema.EventGovernanceSchema>;
export type EventMatrices = z.infer<typeof Schema.EventMatricesSchema>;
export type EventTicket = z.infer<typeof TicketSchema>;

export type EventDocument = Event & mongoose.Document;
