import { Request, Response } from 'express';
import { asyncHandler } from '@core/utils/asyncHandler';
import ApiError from '@core/errors/api.error';
import EventPublicRepositories from '../repositories/event-read.repositories';
import { buildPaginationQuery, buildPublicEventLookup } from '../helper/event-pagination.helper';
import { int, object, string } from 'zod';
import { serializePublicEvent, serializePublicEvents } from '../helper/serialized-event.helper';

const eventPublicRepository = new EventPublicRepositories();

export class EventPublicController {
  static listPublicEvents = asyncHandler(async (req: Request, res: Response) => {
    const query = object({
      page: int().min(1).default(1),
      limit: int().min(1).max(100).default(10),
      sortBy: string().optional(),
      filters: string().optional(),
    }).parse(req.query);
    const { filters, page, limit, sort } = buildPaginationQuery(query);
    const result = await eventPublicRepository.listPublicEvents(filters, limit, sort, page);
    res.status(200).json({
      success: true,
      data: serializePublicEvents(result.docs),
      pagination: {
        page: result.page ?? page,
        limit: result.limit,
        total: result.totalDocs,
        totalPages: result.totalPages,
        hasPrevPage: result.hasPrevPage,
        hasNextPage: result.hasNextPage,
        prevPage: result.prevPage ?? null,
        nextPage: result.nextPage ?? null,
      },
    });
  });

  static getPublicEvent = asyncHandler(async (req: Request, res: Response) => {
    const eventId = string().min(1).parse(req.params.eventId);
    const filters = buildPublicEventLookup(eventId, req.query.includeUnlisted as string | undefined);
    const event = await eventPublicRepository.getPublicEventByIdOrSlug(filters);
    if (!event) {
      throw new ApiError(404, 'Event not found', 'EVENT_NOT_FOUND', 'The requested public event was not found');
    }
    res.status(200).json({
      success: true,
      event: serializePublicEvent(event),
    });
  });
}
