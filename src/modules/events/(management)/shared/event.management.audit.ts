import writeEventAudit from '../../../../audits/events.audit';
import { Request } from 'express';

export const writeEventManagementAudit = (params: {
  eventId: string;
  organizationId: string;
  actorUserId: string;
  actorRole: string;
  module: 'ticket' | 'session' | 'coupon';
  action: string;
  targetId?: string;
  severity?: 'info' | 'warning' | 'critical' | 'error';
  metadata?: Record<string, unknown>;
  req?: Request;
}) =>
  writeEventAudit({
    eventId: params.eventId,
    organizationId: params.organizationId,
    actorUserId: params.actorUserId,
    actorRole: params.actorRole,
    action: `${params.module}.${params.action}`,
    targetId: params.targetId,
    severity: params.severity ?? 'info',
    metadata: params.metadata,
    req: params.req as unknown as { ip?: string; userAgent?: string },
  });
