import pool from "@config/pg";
import { OrganizationAuditInput, OrganizationAuditSchema } from "./types/organization.audit.types";
import logger from "@config/logger";

export async function writeOrganizationAudit(input: OrganizationAuditInput): Promise<void> {
  const parsed = OrganizationAuditSchema.parse(input);
  const {
    organizationId,
    actorUserId,
    actorRole,
    action,
    severity,
    targetType,
    targetId,
    metadata,
    req,
  } = parsed;
  const ipAddress = req?.ip ?? null;
  const userAgent = req?.userAgent ?? null;

  await pool
    .query(
      `
    INSERT INTO organization_audit (
      organization_id,
      actor_user_id,
      actor_role,
      action,
      severity,
      target_type,
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
        organizationId,
        actorUserId ?? null,
        actorRole,
        action,
        severity,
        targetType ?? null,
        targetId ?? null,
        metadata ?? {},
        ipAddress,
        userAgent,
      ],
    )
    .catch((err) => {
      logger.error("Failed to write organization audit log", err);
    });
}

export default writeOrganizationAudit;
