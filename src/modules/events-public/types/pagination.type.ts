export interface EventPaginationQuery {
  page?: number | string;
  limit?: number | string;
  category?: string;
  fromDate?: string | Date;
  toDate?: string | Date;
  search?: string;
  tags?: string | string[];
  mode?: string;
  visibility?: string;
  organizationId?: string;
  isRegistrationOpen?: boolean | string;
  includeUnlisted?: boolean | string;
  status?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  registrationStartFrom?: string | Date;
  registrationEndTo?: string | Date;
}
