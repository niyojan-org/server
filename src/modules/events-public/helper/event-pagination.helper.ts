import { Types } from 'mongoose';
import { EventPaginationQuery } from '../types/pagination.type';
import { EventStatus, EventVisibility } from '@modules/events/core/event.enums';

const parseBoolean = (
  value: boolean | string | undefined,
): boolean | undefined => {
  if (value === undefined) return undefined;
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') return value.toLowerCase() === 'true';
  return undefined;
};

const parseDate = (value: string | Date | undefined): Date | undefined => {
  if (!value) return undefined;
  if (value instanceof Date)
    return Number.isNaN(value.getTime()) ? undefined : value;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
};

const parseStringArray = (
  value: string | string[] | undefined,
): string[] | undefined => {
  if (!value) return undefined;
  if (Array.isArray(value)) return value.filter(Boolean);
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
};

const allowedSortFields = new Set([
  'createdAt',
  'publishedAt',
  'registrationStart',
  'registrationEnd',
  'title',
]);

export const buildPaginationQuery = (options: EventPaginationQuery) => {
  const page = Math.max(1, Number.parseInt(String(options.page ?? 1), 10) || 1);
  const limit = Math.max(
    1,
    Math.min(100, Number.parseInt(String(options.limit ?? 10), 10) || 10),
  );
  const skip = (page - 1) * limit;

  const filters: Record<string, unknown> = {
    isPublished: true,
    isBlocked: false,
    isPrivate: false,
  };

  const includeUnlisted = parseBoolean(options.includeUnlisted);
  filters.visibility = includeUnlisted
    ? { $in: [EventVisibility.PUBLIC, EventVisibility.UNLISTED] }
    : EventVisibility.PUBLIC;

  if (options.status) {
    filters.status = options.status;
  } else {
    filters.status = { $in: [EventStatus.PUBLISHED, EventStatus.ONGOING] };
  }

  if (options.category) {
    filters.category = options.category;
  }

  if (options.mode) {
    filters.mode = options.mode;
  }

  if (options.visibility) {
    filters.visibility = options.visibility;
  }

  if (
    options.organizationId &&
    Types.ObjectId.isValid(options.organizationId)
  ) {
    filters.organizationId = new Types.ObjectId(options.organizationId);
  }

  const isRegistrationOpen = parseBoolean(options.isRegistrationOpen);
  if (isRegistrationOpen !== undefined) {
    filters.isRegistrationOpen = isRegistrationOpen;
  }

  const tags = parseStringArray(options.tags);
  if (tags && tags.length > 0) {
    filters.tags = { $in: tags };
  }

  const fromDate = parseDate(options.fromDate);
  const toDate = parseDate(options.toDate);
  if (fromDate || toDate) {
    filters.createdAt = {};
    if (fromDate) {
      (filters.createdAt as Record<string, unknown>).$gte = fromDate;
    }
    if (toDate) {
      (filters.createdAt as Record<string, unknown>).$lte = toDate;
    }
  }

  const registrationStartFrom = parseDate(options.registrationStartFrom);
  if (registrationStartFrom) {
    filters.registrationStart = { $gte: registrationStartFrom };
  }

  const registrationEndTo = parseDate(options.registrationEndTo);
  if (registrationEndTo) {
    filters.registrationEnd = { $lte: registrationEndTo };
  }

  const search = options.search?.trim();
  if (search) {
    filters.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { slug: { $regex: search, $options: 'i' } },
    ];
  }

  const sortBy =
    options.sortBy && allowedSortFields.has(options.sortBy)
      ? options.sortBy
      : 'createdAt';
  const sortOrder = options.sortOrder === 'asc' ? 1 : -1;
  const sort = { [sortBy]: sortOrder } as Record<string, 1 | -1>;

  return { filters, page, limit, skip, sort };
};

export const buildPublicEventLookup = (
  eventId: string,
  includeUnlisted?: boolean | string,
) => {
  const include = parseBoolean(includeUnlisted);
  const visibility = include
    ? { $in: [EventVisibility.PUBLIC, EventVisibility.UNLISTED] }
    : EventVisibility.PUBLIC;

  const matchByIdOrSlug: Array<Record<string, unknown>> = [{ slug: eventId }];
  if (Types.ObjectId.isValid(eventId)) {
    matchByIdOrSlug.push({ _id: new Types.ObjectId(eventId) });
  }

  return {
    isPublished: true,
    isBlocked: false,
    isPrivate: false,
    visibility,
    $or: matchByIdOrSlug,
  } as Record<string, unknown>;
};
