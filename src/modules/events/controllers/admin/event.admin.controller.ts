import { AuthenticatedRequest } from "@core/middlewares/auth.middleware";
import { asyncHandler } from "@core/utils/asyncHandler";
import { EventSchema } from "@modules/events/core/event.zod";
import { createNewEvent } from "@modules/events/services/event.service";
import z from "zod";

export const createEvent = asyncHandler(async (req: AuthenticatedRequest, res) => {
  const event = z.parse(EventSchema, req.body);
  event.organizationId = req.user?.organization?.id!;
  event.createdBy = req.user?._id!;
  const newEvent = await createNewEvent(event);
  res.status(201).json({ success: true, message: "Event created successfully", event: newEvent });
});
