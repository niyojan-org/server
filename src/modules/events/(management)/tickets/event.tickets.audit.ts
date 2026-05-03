import writeEventAudit from '../../../../audits/events.audit';
import { OrganizationRole } from '../../../events/views/event.role.view';
import { Request } from 'express';

export const writeEventTicketAudit = (params: {
  eventId: string;
  organizationId: string;
  actorUserId: string;
  actorRole: OrganizationRole;
  action: string;
  targetId?: string;
  severity?: 'info' | 'warning' | 'critical' | 'error';
  metadata?: Record<string, unknown>;
  req?: Request;
}) => {
  writeEventAudit({
    eventId: params.eventId,
    organizationId: params.organizationId,
    actorUserId: params.actorUserId,
    actorRole: params.actorRole as string,
    action: `ticket.${params.action}`,
    targetId: params.targetId,
    severity: params.severity || 'info',
    metadata: params.metadata,
    req: params.req as unknown as { ip?: string; userAgent?: string },
  });
};
