import { SessionBaseSchema } from '@modules/events/core/event.zod';
import z from 'zod';

export const AddingSessionSchema = SessionBaseSchema.refine(
  (session) => session.endTime > session.startTime,
  {
    message: 'Session end time must be after start time',
    path: ['endTime'],
  },
);

export const UpdatingSessionSchema = SessionBaseSchema.partial().superRefine(
  (session, ctx) => {
    if (
      session.startTime &&
      session.endTime &&
      session.endTime <= session.startTime
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Session end time must be after start time',
        path: ['endTime'],
      });
    }
  },
);
