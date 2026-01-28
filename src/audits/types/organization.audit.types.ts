import { ORGANIZATION_ROLES } from "@modules/user/user.constants";
import z from "zod";

export const OrganizationAuditSchema = z.object({
  organizationId: z.string().min(1),
  actorUserId: z.string().min(1).optional(),
  actorRole: z.enum(ORGANIZATION_ROLES).default("system"),
  action: z.string().min(1),
  severity: z.enum(["info", "warning", "critical"]).default("info"),
  targetType: z.string().min(1).optional(),
  targetId: z.string().min(1).optional(),
  metadata: z.unknown().optional(),
  req: z
    .object({
      ip: z.string().optional(),
      userAgent: z.string().optional(),
    })
    .optional(),
});

export type OrganizationAuditInput = z.infer<typeof OrganizationAuditSchema>;
