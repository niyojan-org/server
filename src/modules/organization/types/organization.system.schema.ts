import { objectIdSchema } from "@helpers/zod";
import z from "zod";
import * as OrganizationEnums from "./organization.enums";

export const OrganizationSystemSchema = z.object({
  // verification
  verified: z.boolean(),
  verifiedAt: z.date().optional(),
  verifiedBy: objectIdSchema.optional(),
  rejectionReason: z.string().optional(),

  // trust & risk
  trustScore: z.number().min(0).max(100),
  riskLevel: z.enum(Object.values(OrganizationEnums.RiskLevel)),

  // controls
  isBlocked: z.boolean(),
  blockReason: z.string().optional(),
  blockType: z.enum(Object.values(OrganizationEnums.BlockType)).optional(),

  // paid events (PLATFORM CONTROLLED)
  allowsPaidEvents: z.boolean(),

  // stats & analytics
  stats: z.object({
    totalEventsHosted: z.number(),
    totalTicketsSold: z.number(),
    totalBlockedEvents: z.number(),
    totalWarnings: z.number(),
  }),
});
