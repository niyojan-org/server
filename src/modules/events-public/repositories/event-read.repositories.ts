import { EventModel } from '@modules/events/persistence/event.model';
import type { PaginateResult } from 'mongoose';
import type { EventDocument } from '@modules/events/core/event.types';

class EventPublicRepositories {
  async listPublicEvents(
    filters: Record<string, unknown>,
    limit: number,
    sort: Record<string, 1 | -1>,
    page: number,
  ): Promise<PaginateResult<EventDocument>> {
    const model = EventModel as unknown as {
      paginate: (
        query: Record<string, unknown>,
        options: {
          page: number;
          limit: number;
          sort: Record<string, 1 | -1>;
          lean: true;
        },
      ) => Promise<PaginateResult<EventDocument>>;
    };
    return model.paginate(filters, { page, limit, sort, lean: true });
  }

  async getPublicEventByIdOrSlug(filters: Record<string, unknown>) {
    return EventModel.findOne(filters).lean();
  }
}

export default EventPublicRepositories;
