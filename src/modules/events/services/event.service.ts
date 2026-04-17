import { Types } from 'mongoose';
import { Event } from '../core/event.types';
import { EventStatus } from '../core/event.enums';
import { generateUniqueSlug } from '../helper/slug';
import { EventRepository } from '../persistence/event.repository';
import { EventAdminDataRequestParamsType } from '../types/event.admin.query';
import writeOrganizationAudit from '../../../audits/organization.audit';
import {
  getEventListViewByRole,
  type OrganizationRole,
} from '../views/event.role.view';

export const createNewEvent = async (event: Event) => {
  const slug = await generateUniqueSlug(event.title);
  event.slug = slug;
  const newEvent = await EventRepository.create(event);
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
