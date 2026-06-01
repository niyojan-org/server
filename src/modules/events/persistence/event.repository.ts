import { Types, ClientSession } from 'mongoose';
import { EventModel } from './event.model';
import { EventStatus } from '../core/event.enums';
import { Event, EventDocument } from '../core/event.types';
import { EventTicket } from '../types';
import { isObjectId, ObjectId } from '@helpers/zod';

export class EventRepository {
  static async create(event: Event): Promise<EventDocument> {
    const doc = new EventModel(event);
    return doc.save();
  }
  static async getEventForOrganization(
    eventId: string | ObjectId,
    organizationId: Types.ObjectId,
  ): Promise<EventDocument | null> {
    if (isObjectId(eventId)) {
      return EventModel.findOne({ _id: eventId, organizationId }).lean();
    } else {
      return EventModel.findOne({ organizationId, slug: eventId.toString() }).lean();
    }
  }

  static async find(input: string | Types.ObjectId): Promise<EventDocument | null> {
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

  static async findByIdOrSlug(input: string | Types.ObjectId): Promise<EventDocument | null> {
    if (input instanceof Types.ObjectId || Types.ObjectId.isValid(input)) {
      return EventModel.findById(input).lean();
    }
    return EventModel.findOne({ slug: input }).lean();
  }

  static async findOrgEvent(eventId: Types.ObjectId, organizationId: Types.ObjectId) {
    return EventModel.findOne({ _id: eventId, organizationId }).lean();
  }

  static async listByOrganization(organizationId: Types.ObjectId, status?: EventStatus) {
    const query: { organizationId: Types.ObjectId; status?: EventStatus } = {
      organizationId,
    };
    if (status) query.status = status;

    return EventModel.find(query).sort({ createdAt: -1 }).lean();
  }

  static async findAll(query: Record<string, unknown>, skip: number, limit: number) {
    return EventModel.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean();
  }

  static async countAll(query: Record<string, unknown>) {
    return EventModel.countDocuments(query);
  }

  static async updateById(eventId: Types.ObjectId, update: Partial<EventDocument>) {
    return EventModel.findByIdAndUpdate(eventId, update, {
      returnDocument: 'after',
    }).lean();
  }

  static async updateOrgEvent(eventId: Types.ObjectId, organizationId: Types.ObjectId, update: Partial<EventDocument>) {
    return EventModel.findOneAndUpdate({ _id: eventId, organizationId }, update, {
      returnDocument: 'after',
    }).lean();
  }

  static async updateStatus(eventId: Types.ObjectId, status: EventStatus, extra: Partial<EventDocument> = {}) {
    return EventModel.findByIdAndUpdate(eventId, { status, ...extra }, { returnDocument: 'after' }).lean();
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

  /**
   * OPTION 1: Atomically increment ticket sold count
   * Prevents race conditions where multiple registrations could all pass capacity check
   * @returns updated ticket or null if capacity exceeded
   */
  static async atomicIncrementTicketSold(
    eventId: Types.ObjectId,
    ticketId: Types.ObjectId,
    quantity: number,
    session?: ClientSession,
  ): Promise<{ success: boolean; error?: string }> {
    // Use MongoDB arrayFilters to update the specific ticket in the event's tickets array
    const result = await EventModel.findOneAndUpdate(
      { _id: eventId },
      { $inc: { 'tickets.$[ticket].sold': quantity } },
      { new: true, session, arrayFilters: [{ 'ticket._id': ticketId }] },
    );
    if (!result) {
      return { success: false, error: 'Event or ticket not found' };
    }
    // Verify ticket doesn't exceed capacity
    const ticket = result.tickets?.find((t) => t._id?.toString() === ticketId.toString());
    if (ticket && ticket.sold > ticket.capacity) {
      // Rollback the increment
      await EventModel.findOneAndUpdate(
        { _id: eventId },
        { $inc: { 'tickets.$[ticket].sold': -quantity } },
        { session, arrayFilters: [{ 'ticket._id': ticketId }] },
      );
      return { success: false, error: 'Ticket capacity exceeded' };
    }
    return { success: true };
  }

  /**
   * Decrement ticket sold count (for cancellations/refunds)
   */
  static async decrementTicketSold(
    eventId: Types.ObjectId,
    ticketId: Types.ObjectId,
    quantity: number,
    session?: ClientSession,
  ): Promise<boolean> {
    const result = await EventModel.findOneAndUpdate(
      { _id: eventId },
      { $inc: { 'tickets.$[ticket].sold': -Math.abs(quantity) } },
      { session, arrayFilters: [{ 'ticket._id': ticketId }] },
    );
    return !!result;
  }

  /**
   * Get ticket from event
   */
  static async getTicketById(eventId: Types.ObjectId, ticketId: Types.ObjectId): Promise<EventTicket | null> {
    const event = await EventModel.findOne({ _id: eventId, 'tickets._id': ticketId }, { 'tickets.$': 1 }).lean();
    if (!event?.tickets?.[0]) return null;
    return event.tickets[0];
  }
}
