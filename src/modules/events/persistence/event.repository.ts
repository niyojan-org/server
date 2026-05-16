import { Types } from 'mongoose';
import { EventModel } from './event.model';
import { EventStatus } from '../core/event.enums';
import { Event, EventDocument } from '../core/event.types';
import { isObjectId } from '@helpers/zod';

export class EventRepository {
  static async create(event: Event): Promise<EventDocument> {
    const doc = new EventModel(event);
    return doc.save();
  }

  static async find(
    input: string | Types.ObjectId,
  ): Promise<EventDocument | null> {
    if (input instanceof Types.ObjectId || Types.ObjectId.isValid(input)) {
      return EventModel.findById(input).lean();
    }

    return EventModel.findOne({ slug: input }).lean();
  }

  static async findById(eventId: Types.ObjectId) {
    return EventModel.findById(eventId).lean();
  }

  static async findBySlug(slug: string) {
    return EventModel.findOne({ slug }).lean();
  }

  static async findOrgEvent(
    eventId: Types.ObjectId,
    organizationId: Types.ObjectId,
  ) {
    return EventModel.findOne({ _id: eventId, organizationId }).lean();
  }

  static async listByOrganization(
    organizationId: Types.ObjectId,
    status?: EventStatus,
  ) {
    const query: { organizationId: Types.ObjectId; status?: EventStatus } = {
      organizationId,
    };
    if (status) query.status = status;

    return EventModel.find(query).sort({ createdAt: -1 }).lean();
  }

  static async findAll(
    query: Record<string, unknown>,
    skip: number,
    limit: number,
  ) {
    return EventModel.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
  }

  static async countAll(query: Record<string, unknown>) {
    return EventModel.countDocuments(query);
  }

  static async updateById(
    eventId: Types.ObjectId,
    update: Partial<EventDocument>,
  ) {
    return EventModel.findByIdAndUpdate(eventId, update, {
      returnDocument: 'after',
    }).lean();
  }

  static async updateOrgEvent(
    eventId: Types.ObjectId,
    organizationId: Types.ObjectId,
    update: Partial<EventDocument>,
  ) {
    return EventModel.findOneAndUpdate(
      { _id: eventId, organizationId },
      update,
      {
        returnDocument: 'after',
      },
    ).lean();
  }

  static async updateStatus(
    eventId: Types.ObjectId,
    status: EventStatus,
    extra: Partial<EventDocument> = {},
  ) {
    return EventModel.findByIdAndUpdate(
      eventId,
      { status, ...extra },
      { returnDocument: 'after' },
    ).lean();
  }

  static async softDelete(eventId: Types.ObjectId, reason?: string) {
    return EventModel.findByIdAndUpdate(
      eventId,
      {
        status: EventStatus.CANCELLED,
        unpublishedReason: reason,
        unpublishedAt: new Date(),
      },
      { returnDocument: 'after' },
    ).lean();
  }

  static async incrementView(slug: string) {
    return EventModel.updateOne({ slug }, { $inc: { 'metrics.view': 1 } });
  }

  static async getTicketByIdOrType(
    eventIdOrSlug: string,
    ticketIdOrType: string,
  ) {
    const isEventIdObjectId = isObjectId(eventIdOrSlug);
    const IsTicketIdObjectId = isObjectId(ticketIdOrType);
    const query: Record<string, unknown> = {};

    if (isEventIdObjectId) {
      query._id = new Types.ObjectId(eventIdOrSlug);
    } else {
      query.slug = eventIdOrSlug;
    }
    if (IsTicketIdObjectId) {
      query['tickets._id'] = new Types.ObjectId(ticketIdOrType);
    } else {
      query['tickets.type'] = ticketIdOrType;
    }
    const event = await EventModel.findOne(query, { 'tickets.$': 1 }).lean();
    return event?.tickets?.[0] || null;
  }
}
