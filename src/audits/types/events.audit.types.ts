import { Types } from 'mongoose';
import { z } from 'zod';

const auditIdSchema = z
  .union([z.string(), z.instanceof(Types.ObjectId)])
  .transform((value) => value.toString())
  .pipe(z.string().min(1));

export const EventAuditSchema = z.object({
  eventId: auditIdSchema,
  organizationId: auditIdSchema,
  actorUserId: auditIdSchema.nullable().optional(),
  actorRole: z.string().nullable().optional(),
  action: z.string().min(1),
  severity: z.string().default('info'),
  targetId: auditIdSchema.nullable().optional(),
  metadata: z.unknown().optional(),
  req: z
    .object({
      ip: z.string().optional(),
      userAgent: z.string().optional(),
    })
    .optional(),
});

export type EventAuditInput = z.input<typeof EventAuditSchema>;
export type ParsedEventAuditInput = z.output<typeof EventAuditSchema>;

export const eventAuditSchema = z.object({
  id: z.number().int().positive().optional(), // auto-generated

  event_id: z.string().min(1),
  organization_id: z.string().min(1),

  actor_user_id: z.string().nullable().optional(),
  actor_role: z.string().nullable().optional(),

  action: z.string().min(1),
  target_id: z.string().nullable().optional(),

  severity: z.string().default('info'),

  metadata: z.unknown().optional(),

  ip_address: z.string().optional(),

  user_agent: z.string().optional(),

  created_at: z.coerce.date().optional(), // auto default from DB
});

export type EventAudit = z.infer<typeof eventAuditSchema>;
