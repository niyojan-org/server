import z from 'zod';
import { EventStatus } from '../core/event.enums';

export const EventAdminDataRequestParams = z.object({
  page: z.string().optional().default('1'),
  limit: z.string().optional().default('10'),
  status: z
    .enum(Object.values(EventStatus) as [string, ...string[]])
    .default('all'),
  isPublished: z.string().default('all'),
  search: z.string().optional(),
});

export type EventAdminDataRequestParamsType = z.infer<
  typeof EventAdminDataRequestParams
>;
