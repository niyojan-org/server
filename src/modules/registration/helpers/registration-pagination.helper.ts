import { RegistrationListQueryDto } from '../dto/registration-management.dto';

const allowedSortFields = new Set(['createdAt', 'updatedAt', 'participantsCount', 'status']);
const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;

export interface PaginationQuery {
  query: Record<string, unknown>;
  options: {
    page: number;
    limit: number;
    skip: number;
    sort: Record<string, 1 | -1>;
    populate?: string;
  };
}

/**
 * Build pagination query for registration list
 * Validates and normalizes pagination parameters
 */
export const buildRegistrationPaginationQuery = (options: RegistrationListQueryDto): PaginationQuery => {
  const result: PaginationQuery = {
    query: {},
    options: { page: DEFAULT_PAGE, limit: DEFAULT_LIMIT, skip: 0, sort: { createdAt: -1 } },
  };
  result.options.page = Math.max(
    DEFAULT_PAGE,
    Number.parseInt(String(options.page ?? DEFAULT_PAGE), 10) || DEFAULT_PAGE,
  );
  result.options.limit = Math.max(
    1,
    Math.min(MAX_LIMIT, Number.parseInt(String(options.limit ?? DEFAULT_LIMIT), 10) || DEFAULT_LIMIT),
  );
  result.options.skip = (result.options.page - 1) * result.options.limit;

  // Build filters
  result.query = {};
  if (options.status) {
    result.query.status = options.status;
  }

  // Search in group name and coupon code
  if (options.search) {
    const searchRegex = { $regex: options.search, $options: 'i' };
    result.query.$or = [{ 'groupInfo.groupName': searchRegex }, { 'coupon.code': searchRegex }];
  }

  // Sorting with validation
  const sortBy = options.sortBy && allowedSortFields.has(options.sortBy) ? options.sortBy : 'createdAt';
  const sortOrder = options.sortOrder === 'asc' ? 1 : -1;
  result.options.sort = { [sortBy]: sortOrder } as Record<string, 1 | -1>;
  if (options.needParticipants) {
    result.options.populate = 'participantIds';
  }
  return result;
};
