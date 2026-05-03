import { TicketBaseSchema } from '@modules/events/core/event.zod';
import z from 'zod';

const TicketWriteObjectSchema = TicketBaseSchema.omit({ sold: true });

const TicketWriteSchema = TicketWriteObjectSchema.refine(
  (ticket) => (ticket.isGroupTicket ? !!ticket.groupSettings : true),
  {
    message: 'Group settings must be provided for group tickets',
    path: ['groupSettings'],
  },
).refine(
  (ticket) => ticket.salesEndTime > ticket.salesStartTime,
  {
    message: 'Ticket sales end time must be after sales start time',
    path: ['salesEndTime'],
  },
);

export const AddingTicketSchema = TicketWriteSchema;
export const UpdatingTicketSchema = TicketWriteObjectSchema.partial().superRefine(
  (ticket, ctx) => {
    if (ticket.isGroupTicket === true && !ticket.groupSettings) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Group settings must be provided for group tickets',
        path: ['groupSettings'],
      });
    }
    if (
      ticket.salesStartTime &&
      ticket.salesEndTime &&
      ticket.salesEndTime <= ticket.salesStartTime
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Ticket sales end time must be after sales start time',
        path: ['salesEndTime'],
      });
    }
  },
);

export const TicketPurchaseValidationSchema = z.object({
  ticketId: z.string().min(1, 'Ticket id is required'),
  quantity: z
    .number()
    .int({ message: 'Quantity must be a whole number' })
    .min(1, { message: 'Quantity must be at least 1' })
    .default(1),
});

export type AddingTicketInput = z.infer<typeof AddingTicketSchema>;
