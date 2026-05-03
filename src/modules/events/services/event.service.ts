import { Types } from 'mongoose';
import { CreateEventInput, Event } from '../core/event.types';
import { EventStatus } from '../core/event.enums';
import { generateUniqueSlug } from '../helper/slug';
import { EventRepository } from '../persistence/event.repository';
import { EventAdminDataRequestParamsType } from '../types/event.admin.query';
import writeOrganizationAudit from '../../../audits/organization.audit';
import {
  getEventViewByRole,
  getEventListViewByRole,
  type OrganizationRole,
} from '../views/event.role.view';
import { EventModel } from '../persistence/event.model';
import ApiError from '@core/errors/api.error';
import { OrganizationRepository } from '@modules/organization/persistence/organization.repository';
import { validateEventCreation } from '../core/event.creation';

export const createNewEvent = async (
  event: CreateEventInput,
  organizationId: string | Types.ObjectId,
  createdBy: string | Types.ObjectId,
) => {
  const organization = await OrganizationRepository.findById(organizationId);
  if (!organization) {
    throw new ApiError(
      404,
      'Organization not found',
      'ORGANIZATION_NOT_FOUND',
      'The organization for this event could not be found.',
    );
  }

  validateEventCreation(event, organization);

  const slug = await generateUniqueSlug(event.title);
  const newEvent = await EventRepository.create({
    ...event,
    slug,
    organizationId,
    createdBy,
  } as Event);
  await writeOrganizationAudit({
    organizationId: newEvent.organizationId.toString(),
    actorUserId: newEvent.createdBy?.toString(),
    actorRole: 'system',
    action: 'EVENT_CREATED',
    severity: 'info',
    targetType: 'event',
    targetId: newEvent._id.toString(),
    metadata: {
      title: newEvent.title,
      slug: newEvent.slug,
    },
  });
  return newEvent;
};

export const getAllEvents = async (
  organizationId: string | Types.ObjectId,
  options: EventAdminDataRequestParamsType,
  role?: OrganizationRole,
) => {
  const page = Math.max(1, Number.parseInt(options.page, 10) || 1);
  const limit = Math.max(1, Number.parseInt(options.limit, 10) || 10);
  const skip = (page - 1) * limit;

  const orgObjectId =
    organizationId instanceof Types.ObjectId
      ? organizationId
      : new Types.ObjectId(organizationId);

  const query: Record<string, unknown> = {
    organizationId: orgObjectId,
  };

  if (options.status !== 'all') {
    query.status = options.status as EventStatus;
  }

  if (options.isPublished === 'true') {
    query.isPublished = true;
  } else if (options.isPublished === 'false') {
    query.isPublished = false;
  }

  const search = options.search?.trim();
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { slug: { $regex: search, $options: 'i' } },
    ];
  }

  const [events, total] = await Promise.all([
    EventRepository.findAll(query, skip, limit),
    EventRepository.countAll(query),
  ]);

  const visibleEvents = getEventListViewByRole(
    events as unknown as Record<string, unknown>[],
    role,
  );

  return {
    events: visibleEvents,
    pagination: {
      page,
      limit,
      total,
      totalItems: total,
      totalPages: Math.ceil(total / limit),
      hasPrevPage: page > 1,
      hasNextPage: page < Math.ceil(total / limit),
      prevPage: page > 1 ? page - 1 : null,
      nextPage: page < Math.ceil(total / limit) ? page + 1 : null,
    },
  };
};

export const getByEventId = async (
  organizationId: string | Types.ObjectId,
  eventId: string,
  role?: OrganizationRole,
) => {
  const orgObjectId =
    organizationId instanceof Types.ObjectId
      ? organizationId
      : new Types.ObjectId(organizationId);

  const matchByIdOrSlug: Array<Record<string, unknown>> = [{ slug: eventId }];
  if (Types.ObjectId.isValid(eventId)) {
    matchByIdOrSlug.push({ _id: new Types.ObjectId(eventId) });
  }

  const event = await EventModel.findOne({
    organizationId: orgObjectId,
    $or: matchByIdOrSlug,
  }).lean();

  if (!event) {
    throw new ApiError(
      404,
      'Event not found',
      'EVENT_NOT_FOUND',
      'No event found with the provided ID or slug for this organization.',
    );
  }

  const visibleEvent = getEventViewByRole(
    event as unknown as Record<string, unknown>,
    role,
  );

  return visibleEvent;
};
