import ApiError from '@core/errors/api.error';
import { AuthenticatedRequest } from '@core/middlewares/auth.middleware';
import { asyncHandler } from '@core/utils/asyncHandler';
import { EventSchema } from '@modules/events/core/event.zod';
import {
  createNewEvent,
  getAllEvents,
} from '@modules/events/services/event.service';
import { EventAdminDataRequestParams } from '@modules/events/types/event.admin.query';
import { getEventViewByRole } from '@modules/events/views/event.role.view';
import z from 'zod';

export const createEvent = asyncHandler(
  async (req: AuthenticatedRequest, res) => {
    const event = z.parse(EventSchema, req.body);
    const organizationId = req.user?.organization?.id;
    const createdBy = req.user?._id;
    if (!organizationId || !createdBy) {
      throw new ApiError(
        400,
        'Invalid request: Missing organization or user information.',
        'INVALID_REQUEST',
        'Ensure that the user is authenticated and belongs to an organization.',
      );
    }
    event.organizationId = organizationId;
    event.createdBy = createdBy;
    const newEvent = await createNewEvent(event);
    const role = req.user?.organization?.role;
    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      event: getEventViewByRole(
        newEvent.toObject() as Record<string, unknown>,
        role,
      ),
    });
  },
);

export const getEvents = asyncHandler(
  async (req: AuthenticatedRequest, res) => {
    const organizationId = req.user?.organization?.id;
    const organizationRole = req.user?.organization?.role;
    if (!organizationId) {
      throw new ApiError(
        400,
        'Invalid request: Missing organization information.',
        'INVALID_REQUEST',
        'Ensure that the user is authenticated and belongs to an organization.',
      );
    }
    const options = EventAdminDataRequestParams.parse(req.query);
    const data = await getAllEvents(organizationId, options, organizationRole);
    res.status(200).json({
      success: true,
      message: 'Events retrieved successfully',
      ...data,
    });
  },
);
