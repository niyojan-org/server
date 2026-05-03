import ApiError from '@core/errors/api.error';
import { OrganizationRepository } from '@modules/organization/persistence/organization.repository';
import { EventRepository } from '@modules/events/persistence/event.repository';
import { EventModel } from '@modules/events/persistence/event.model';
import { EventDocument } from '@modules/events/core/event.types';
import mongoose from 'mongoose';

export type EventCollectionKey = 'tickets' | 'sessions' | 'coupons';

export const findEventOrThrow = async (eventId: string) => {
  const event = await EventRepository.find(eventId);
  if (!event) {
    throw new ApiError(
      404,
      'Event not found',
      'EVENT_NOT_FOUND',
      `No event found with identifier ${eventId}.`,
    );
  }
  return event;
};

export const findEventOrganizationOrThrow = async (
  event: Pick<EventDocument, 'organizationId'>,
) => {
  const organization = await OrganizationRepository.findById(event.organizationId);
  if (!organization) {
    throw new ApiError(
      404,
      'Organization not found',
      'ORGANIZATION_NOT_FOUND',
      'The organization linked to this event could not be found.',
    );
  }
  return organization;
};

export const updateEventCollection = async <T>(
  eventId: string,
  key: EventCollectionKey,
  value: T[],
) => {
  const query = mongoose.Types.ObjectId.isValid(eventId)
    ? { _id: eventId }
    : { slug: eventId };

  return EventModel.findOneAndUpdate(query, { [key]: value }, { new: true }).lean();
};

export const resolveCollectionItemIndex = <T extends Record<string, unknown>>(
  items: T[],
  itemId: string,
  key?: keyof T,
) => {
  const matchByObjectId = mongoose.Types.ObjectId.isValid(itemId);
  return items.findIndex((item) => {
    if (matchByObjectId) {
      return item._id?.toString() === itemId;
    }
    if (!key) return false;
    return String(item[key] ?? '').toUpperCase() === itemId.toUpperCase();
  });
};

export const throwItemNotFound = (
  itemType: string,
  itemId: string,
  eventId: string,
) => {
  throw new ApiError(
    404,
    `${itemType} with ID ${itemId} not found`,
    `${itemType.toUpperCase()}_NOT_FOUND`,
    `No ${itemType.toLowerCase()} found with identifier ${itemId} for event ${eventId}.`,
  );
};
