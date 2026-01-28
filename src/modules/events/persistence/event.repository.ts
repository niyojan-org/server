import { Types } from "mongoose";
import { EventModel } from "./event.model";
import { EventStatus } from "../core/event.enums";
import { Event, EventDocument } from "../core/event.types";

export class EventRepository {
  static async create(event: Event): Promise<EventDocument> {
    const doc = new EventModel(event);
    return doc.save();
  }

  static async find(input: string | Types.ObjectId) {
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

  static async findOrgEvent(eventId: Types.ObjectId, organizationId: Types.ObjectId) {
    return EventModel.findOne({ _id: eventId, organizationId }).lean();
  }

  static async listByOrganization(organizationId: Types.ObjectId, status?: EventStatus) {
    const query: any = { organizationId };
    if (status) query.status = status;

    return EventModel.find(query).sort({ createdAt: -1 }).lean();
  }

  static async updateById(eventId: Types.ObjectId, update: Partial<EventDocument>) {
    return EventModel.findByIdAndUpdate(eventId, update, {
      new: true,
    }).lean();
  }

  static async updateOrgEvent(
    eventId: Types.ObjectId,
    organizationId: Types.ObjectId,
    update: Partial<EventDocument>,
  ) {
    return EventModel.findOneAndUpdate({ _id: eventId, organizationId }, update, {
      new: true,
    }).lean();
  }

  static async updateStatus(
    eventId: Types.ObjectId,
    status: EventStatus,
    extra: Partial<EventDocument> = {},
  ) {
    return EventModel.findByIdAndUpdate(eventId, { status, ...extra }, { new: true }).lean();
  }

  static async softDelete(eventId: Types.ObjectId, reason?: string) {
    return EventModel.findByIdAndUpdate(
      eventId,
      {
        status: EventStatus.CANCELLED,
        unpublishedReason: reason,
        unpublishedAt: new Date(),
      },
      { new: true },
    ).lean();
  }

  static async incrementView(slug: string) {
    return EventModel.updateOne({ slug }, { $inc: { "metrics.view": 1 } });
  }
}
