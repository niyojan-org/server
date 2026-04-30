import z from 'zod';
import { TicketSchema } from '../core/event.zod';

export type EventTicket = z.infer<typeof TicketSchema>;
