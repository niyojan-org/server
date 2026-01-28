import { z } from "zod";

export const ListOrganizationsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().min(1).optional(),
  category: z.string().optional(),
  verified: z.coerce.boolean().optional(),
  isBlocked: z.coerce.boolean().optional(),
  riskLevel: z.enum(["low", "medium", "high", "critical"]).optional(),
  sortBy: z.enum(["createdAt", "name", "category", "riskLevel", "verified"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export type ListOrganizationsQuery = z.infer<typeof ListOrganizationsQuerySchema>;
