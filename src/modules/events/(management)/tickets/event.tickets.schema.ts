import { objectIdSchema } from '@helpers/zod';
import z from 'zod';

export const GroupSettingsSchema = z
  .object({
    minParticipants: z
      .number()
      .int()
      .min(1, { message: 'Minimum participants must be at least 1' }),
    maxParticipants: z
      .number()
      .int()
      .min(1, { message: 'Maximum participants must be at least 1' }),
    groupLeaderRequired: z.boolean().default(true),
  })
  .refine((data) => data.maxParticipants >= data.minParticipants, {
    message:
      'Maximum participants must be greater than or equal to minimum participants',
  });

export const AddingTicketBaseSchema = z.object({
  _id: objectIdSchema.optional(),
  type: z
    .string()
    .min(1)
    .max(100, { message: 'Ticket type cannot exceed 100 characters' }),

  price: z.number().min(0, { message: 'Ticket price cannot be negative' }),
  capacity: z
    .number()
    .int()
    .min(1, { message: 'Ticket capacity must be at least 1' }),
  sold: z.number().int().min(0).default(0),
  salesStartTime: z.coerce.date({ message: 'Invalid sales start time' }),
  salesEndTime: z.coerce.date({ message: 'Invalid sales end time' }),

  isActive: z.boolean().default(true),
  template: objectIdSchema.optional(),
  isGroupTicket: z.boolean().default(false),
  groupSettings: GroupSettingsSchema.optional(),
});

export const AddingTicketSchema = AddingTicketBaseSchema.refine(
  (t) => (t.isGroupTicket ? !!t.groupSettings : true),
  {
    message: 'Group settings must be provided for group tickets',
  },
).refine(
  (t) =>
    t.salesEndTime && t.salesStartTime
      ? t.salesEndTime > t.salesStartTime
      : true,
  {
    message: 'Ticket sales end time must be after sales start time',
  },
);

export const UpdatingTicketSchema = AddingTicketBaseSchema.partial();
export type AddingTicketInput = z.infer<typeof AddingTicketSchema>;
