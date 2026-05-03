import pool from '@config/pg';
import {
  EventAuditInput,
  EventAuditSchema,
} from './types/events.audit.types';
import logger from '@config/logger';

export async function writeEventAudit(
  input: EventAuditInput,
): Promise<void> {
  const parsed = EventAuditSchema.parse(input);
  const {
    eventId,
    organizationId,
    actorUserId,
    actorRole,
    action,
    severity,
    targetId,
    metadata,
    req,
  } = parsed;
  const ipAddress = req?.ip ?? null;
  const userAgent = req?.userAgent ?? null;

  await pool
    .query(
      `
    INSERT INTO event_audit (
      event_id,
      organization_id,
      actor_user_id,
      actor_role,
      action,
      severity,
      target_id,
      metadata,
      ip_address,
      user_agent
    ) VALUES (
      $1, $2, $3, $4, $5,
      $6, $7, $8, $9, $10
    )
    `,
      [
        eventId,
        organizationId,
        actorUserId ?? null,
        actorRole,
        action,
        severity,
        targetId ?? null,
        metadata ?? {},
        ipAddress,
        userAgent,
      ],
    )
    .catch((err) => {
      logger.error('Failed to write event audit log', err);
    });
}

export default writeEventAudit;
