// Generic pagination helper for building common pagination queries and responses across the application
export interface PaginationOptions {
  page?: number | string;
  limit?: number | string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
}

export interface PaginationResult {
  page: number;
  limit: number;
  skip: number;
  sort: Record<string, 1 | -1>;
}

export interface PaginationResponse<T> {
  docs: T[];
  totalDocs: number;
  limit: number;
  page: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;

export const parsePaginationOptions = (
  options: PaginationOptions,
  allowedSortFields: Set<string> = new Set(['createdAt']),
): PaginationResult => {
  const page = Math.max(1, Number.parseInt(String(options.page ?? DEFAULT_PAGE), 10) || DEFAULT_PAGE);
  const limit = Math.max(
    1,
    Math.min(MAX_LIMIT, Number.parseInt(String(options.limit ?? DEFAULT_LIMIT), 10) || DEFAULT_LIMIT),
  );
  const skip = (page - 1) * limit;

  const sortBy = options.sortBy && allowedSortFields.has(options.sortBy) ? options.sortBy : 'createdAt';
  const sortOrder = options.sortOrder === 'asc' ? 1 : -1;
  const sort = { [sortBy]: sortOrder } as Record<string, 1 | -1>;

  return { page, limit, skip, sort };
};
