import z from 'zod';
import { Types } from 'mongoose';
import * as EventEnums from './event.enums';

// Reusable ObjectId validator
const objectIdSchema = z
  .instanceof(Types.ObjectId, { message: 'Invalid ObjectId' })
  .or(
    z.string().refine((val) => Types.ObjectId.isValid(val), {
      message: 'Invalid ObjectId format',
    }),
  )
  .transform((val) => (typeof val === 'string' ? new Types.ObjectId(val) : val));

export const SessionBaseSchema = z.object({
  _id: objectIdSchema.optional(),
  title: z.string().min(1).max(200, { message: 'Title cannot exceed 200 characters' }),
  description: z.string().optional(),

  startTime: z.coerce.date({ message: 'Invalid start time' }),
  endTime: z.coerce.date({ message: 'Invalid end time' }),

  venue: z
    .object({
      name: z.string().max(100, { message: 'Venue name cannot exceed 100 characters' }),
      locality: z.string().max(300, { message: 'Venue address cannot exceed 300 characters' }),
      city: z.string().max(100, { message: 'City cannot exceed 100 characters' }),
      state: z.string().max(100, { message: 'State cannot exceed 100 characters' }),
      country: z.string().max(100, { message: 'Country cannot exceed 100 characters' }),
      zipCode: z.string().max(20, { message: 'Zip code cannot exceed 20 characters' }),
    })
    .optional(),
  isActive: z.boolean().default(true),

  allowCheckIn: z.boolean().default(false),
  checkInStartTime: z.coerce.date({ message: 'Invalid check-in start time' }).optional(),
  checkInEndTime: z.coerce.date({ message: 'Invalid check-in end time' }).optional(),
  speakers: z.array(z.string().min(1)).optional(),
});

export const SessionSchema = SessionBaseSchema.refine((s) => s.endTime > s.startTime, {
  message: 'Session end time must be after start time',
});

export const GroupSettingsSchema = z
  .object({
    minParticipants: z.number().int().min(1, { message: 'Minimum participants must be at least 1' }),
    maxParticipants: z.number().int().min(1, { message: 'Maximum participants must be at least 1' }),
    groupLeaderRequired: z.boolean().default(true),
  })
  .refine((data) => data.maxParticipants >= data.minParticipants, {
    message: 'Maximum participants must be greater than or equal to minimum participants',
  });

export const TicketBaseSchema = z.object({
  _id: objectIdSchema.optional(),
  type: z.string().min(1).max(100, { message: 'Ticket type cannot exceed 100 characters' }),

  price: z
    .number()
    .int({ message: 'Ticket price must be in paisa as a whole number' })
    .min(0, { message: 'Ticket price cannot be negative' }),
  capacity: z.number().int().min(1, { message: 'Ticket capacity must be at least 1' }),
  sold: z.number().int().min(0).default(0),
  salesStartTime: z.coerce.date({ message: 'Invalid sales start time' }),
  salesEndTime: z.coerce.date({ message: 'Invalid sales end time' }),

  isActive: z.boolean().default(true),
  template: objectIdSchema.optional(),

  isGroupTicket: z.boolean().default(false),
  groupSettings: GroupSettingsSchema.optional(),
});

export const TicketSchema = TicketBaseSchema.refine((t) => (t.isGroupTicket ? !!t.groupSettings : true), {
  message: 'Group settings must be provided for group tickets',
}).refine((t) => (t.salesEndTime && t.salesStartTime ? t.salesEndTime > t.salesStartTime : true), {
  message: 'Ticket sales end time must be after sales start time',
});

export const CustomFieldOptionSchema = z.object({
  label: z.string(),
  value: z.union([z.string(), z.number()]),
});
export const CustomFieldSchema = z.object({
  _id: objectIdSchema.optional(),
  label: z.string().min(1).max(100, { message: 'Field label cannot exceed 100 characters' }),
  name: z.string().min(1).max(100, { message: 'Field name cannot exceed 100 characters' }),
  type: z.enum(Object.values(EventEnums.CustomField) as [string, ...string[]]),
  required: z.boolean().default(false),
  placeholder: z.string().max(200, { message: 'Placeholder cannot exceed 200 characters' }).optional(),
  options: z.array(CustomFieldOptionSchema).optional(),
  minLength: z.number().int().min(0).optional(),
  maxLength: z.number().int().min(1).optional(),
  order: z.number().int().min(0).optional(),
});
export const CouponBaseSchema = z.object({
  _id: objectIdSchema.optional(),
  code: z.string().min(1).max(50, { message: 'Coupon code cannot exceed 50 characters' }).toUpperCase(),
  discountType: z.enum(['percentage', 'fixed']),
  discountValue: z.number().min(0, { message: 'Discount value cannot be negative' }),

  maxUsage: z.number().int().min(1, { message: 'Max usage must be at least 1' }).optional(),
  usedCount: z.number().int().min(0).default(0),

  validTicketTypes: z.array(objectIdSchema).optional(),

  startsAt: z.coerce.date({ message: 'Invalid start date' }).optional(),
  endsAt: z.coerce.date({ message: 'Invalid end date' }).optional(),

  expiresAt: z.coerce.date({ message: 'Invalid expiration date' }).optional(),
  isActive: z.boolean().default(true),
});

export const CouponSchema = CouponBaseSchema.refine(
  (coupon) =>
    coupon.discountType === 'percentage' ? coupon.discountValue <= 100 : Number.isInteger(coupon.discountValue),
  {
    message: 'Percentage discount must be 100 or less and fixed discount must be a whole paisa amount',
    path: ['discountValue'],
  },
).refine((c) => (c.startsAt && c.endsAt ? c.endsAt > c.startsAt : true), {
  message: 'Coupon end date must be after start date',
});

export const EventBaseObjectSchema = z.object({
  title: z
    .string()
    .min(1, { message: 'Title cannot be empty' })
    .max(200, { message: 'Title cannot exceed 200 characters' }),
  description: z.string().optional(),
  bannerImage: z.string().optional(),
  banner: z.string().optional(),
  tags: z
    .array(
      z.string().min(1, { message: 'Tag cannot be empty' }).max(50, { message: 'Tag cannot exceed 50 characters' }),
    )
    .optional(),
  category: z.string(),
  organizationId: objectIdSchema,
  mode: z.enum(Object.values(EventEnums.EventMode) as [string, ...string[]]),
  visibility: z.enum(Object.values(EventEnums.EventVisibility) as [string, ...string[]]),
  registrationStart: z.coerce.date({
    message: 'Invalid registration start date',
  }),
  registrationEnd: z.coerce.date({
    message: 'Invalid registration end date',
  }),
  allowMultipleSessions: z.boolean().default(false),
  allowCoupons: z.boolean().default(false),
  allowReferrals: z.boolean().default(false),

  autoApproveParticipants: z.boolean().default(true),

  enableEmailNotifications: z.boolean().default(true),
  enableWhatsappNotifications: z.boolean().default(false),
});

export const EventBaseSchema = EventBaseObjectSchema.refine((e) => e.registrationEnd > e.registrationStart, {
  message: 'Registration end date must be after start date',
});

export const EventGovernanceSchema = z.object({
  flagged: z.boolean().default(false),
  flaggedReason: z
    .string()
    .min(1, { message: 'Flagged reason cannot be empty' })
    .max(500, { message: 'Flagged reason cannot exceed 500 characters' })
    .optional(),
  reviewedBy: objectIdSchema.optional(),
  reviewedAt: z.coerce.date({ message: 'Invalid reviewed date' }).optional(),
  trustScore: z.number().min(0).max(100).optional(),
});

export const EventMatricesSchema = z.object({
  view: z.number().int().min(0).default(0),
  paidRegistrations: z.number().int().min(0).default(0),
  freeRegistrations: z.number().int().min(0).default(0),
});

export const EventSchema = EventBaseSchema.safeExtend({
  _id: objectIdSchema.optional(),
  slug: z.string().min(1).max(200, { message: 'Slug cannot exceed 200 characters' }).optional(),
  status: z.enum(Object.values(EventEnums.EventStatus) as [string, ...string[]]).default(EventEnums.EventStatus.DRAFT),

  isPublished: z.boolean().default(false),
  isPrivate: z.boolean().default(false),
  joinCode: z.string().optional(),
  isRegistrationOpen: z.boolean().default(false),
  isBlocked: z.boolean().default(false),
  organizationId: objectIdSchema,
  sessions: z.array(SessionSchema).max(50, { message: 'Cannot add more than 50 sessions' }).default([]),
  tickets: z.array(TicketSchema).max(20, { message: 'Cannot add more than 20 ticket types' }).default([]),
  customFields: z.array(CustomFieldSchema).max(30, { message: 'Cannot add more than 30 custom fields' }).default([]),
  coupons: z.array(CouponSchema).max(100, { message: 'Cannot add more than 100 coupons' }).default([]),
  metrics: EventMatricesSchema.default({
    view: 0,
    paidRegistrations: 0,
    freeRegistrations: 0,
  }),
  publishedAt: z.coerce.date({ message: 'Invalid published date' }).optional(),
  unpublishedAt: z.coerce.date({ message: 'Invalid unpublished date' }).optional(),
  unpublishedReason: z
    .string()
    .min(1, { message: 'Unpublished reason cannot be empty' })
    .max(500, { message: 'Unpublished reason cannot exceed 500 characters' })
    .optional(),
  governance: EventGovernanceSchema.default({ flagged: false }),
  createdBy: objectIdSchema.optional(),
}).refine(
  (event) => {
    if (event.mode === EventEnums.EventMode.OFFLINE || event.mode === EventEnums.EventMode.HYBRID) {
      return event.sessions.every((session) => session.venue !== undefined && session.venue !== null);
    }
    return true;
  },
  {
    message: 'All sessions must have venue information when event mode is offline or hybrid',
    path: ['sessions'],
  },
);

const hasDuplicates = (values: string[]) =>
  new Set(values.map((value) => value.trim().toUpperCase())).size !== values.length;

const hasDuplicateFieldNames = (values: string[]) =>
  new Set(values.map((value) => value.trim().toLowerCase())).size !== values.length;

export const CreateEventSchema = EventBaseObjectSchema.omit({
  organizationId: true,
})
  .extend({
    sessions: z.array(SessionSchema).max(50, { message: 'Cannot add more than 50 sessions' }).default([]),
    tickets: z.array(TicketSchema).max(20, { message: 'Cannot add more than 20 ticket types' }).default([]),
    customFields: z.array(CustomFieldSchema).max(30, { message: 'Cannot add more than 30 custom fields' }).default([]),
    coupons: z.array(CouponSchema).max(100, { message: 'Cannot add more than 100 coupons' }).default([]),
  })
  .superRefine((event, ctx) => {
    if (event.registrationEnd <= event.registrationStart) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Registration end date must be after start date',
        path: ['registrationEnd'],
      });
    }

    if (!event.allowMultipleSessions && event.sessions.length > 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Multiple sessions are not allowed unless allowMultipleSessions is true',
        path: ['sessions'],
      });
    }

    if (!event.allowCoupons && event.coupons.length > 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Coupons can only be added when allowCoupons is true',
        path: ['coupons'],
      });
    }

    if (hasDuplicates(event.tickets.map((ticket) => ticket.type))) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Ticket types must be unique within an event',
        path: ['tickets'],
      });
    }

    if (hasDuplicates(event.coupons.map((coupon) => coupon.code))) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Coupon codes must be unique within an event',
        path: ['coupons'],
      });
    }

    if (hasDuplicateFieldNames(event.customFields.map((field) => field.name))) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Custom field names must be unique within an event',
        path: ['customFields'],
      });
    }
  });
