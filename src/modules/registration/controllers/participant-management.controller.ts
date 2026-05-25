import { asyncHandler } from '@core/utils/asyncHandler';
import { OrganizationRequest } from '@core/middlewares/organization.middleware';
import ApiError from '@core/errors/api.error';
import mongoose from 'mongoose';
import {
  updateParticipantSchema,
  updateParticipantStatusSchema,
  checkInParticipantSchema,
  bulkCheckInSchema,
  bulkUpdateParticipantsSchema,
} from '../dto/participant-management.dto';
import { ParticipantManagementService } from '../services/management/participant-management.service';

/**
 * Get all participants for an event
 */
export const getParticipants = asyncHandler(async (req: OrganizationRequest, res) => {
  const eventId = req.params.eventId as string;

  const { page = 1, limit = 10, status, search, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

  const stats = await ParticipantManagementService.getParticipantsByEvent(new mongoose.Types.ObjectId(eventId), {
    page: Number(page),
    limit: Number(limit),
    status: status as string,
    search: search as string,
    sortBy: sortBy as string,
    sortOrder: sortOrder as 'asc' | 'desc',
  });

  res.status(200).json({
    success: true,
    message: 'Participants retrieved successfully',
    ...stats,
  });
});

/**
 * Get single participant details
 */
export const getParticipant = asyncHandler(async (req: OrganizationRequest, res) => {
  const { eventId, participantId } = req.params as { eventId: string; participantId: string };

  const participant = await ParticipantManagementService.getParticipantById(
    new mongoose.Types.ObjectId(participantId),
    new mongoose.Types.ObjectId(eventId),
  );

  res.status(200).json({
    success: true,
    message: 'Participant retrieved successfully',
    data: participant,
  });
});

/**
 * Update participant information
 */
export const updateParticipant = asyncHandler(async (req: OrganizationRequest, res) => {
  const { eventId, participantId } = req.params as { eventId: string; participantId: string };
  const updateData = updateParticipantSchema.parse(req.body);

  const updated = await ParticipantManagementService.updateParticipant(
    new mongoose.Types.ObjectId(participantId),
    new mongoose.Types.ObjectId(eventId),
    updateData,
  );

  res.status(200).json({
    success: true,
    message: 'Participant updated successfully',
    data: updated,
  });
});

/**
 * Update participant status
 */
export const updateParticipantStatus = asyncHandler(async (req: OrganizationRequest, res) => {
  const { eventId, participantId } = req.params as { eventId: string; participantId: string };
  const statusData = updateParticipantStatusSchema.parse(req.body);

  const updated = await ParticipantManagementService.updateParticipantStatus(
    new mongoose.Types.ObjectId(participantId),
    new mongoose.Types.ObjectId(eventId),
    statusData,
  );

  res.status(200).json({
    success: true,
    message: 'Participant status updated successfully',
    data: updated,
  });
});

/**
 * Delete participant
 */
export const deleteParticipant = asyncHandler(async (req: OrganizationRequest, res) => {
  const { eventId, participantId } = req.params as { eventId: string; participantId: string };

  await ParticipantManagementService.deleteParticipant(
    new mongoose.Types.ObjectId(participantId),
    new mongoose.Types.ObjectId(eventId),
  );

  res.status(200).json({
    success: true,
    message: 'Participant deleted successfully',
  });
});

/**
 * Check in a participant
 */
export const checkInParticipant = asyncHandler(async (req: OrganizationRequest, res) => {
  const { eventId, participantId } = req.params as { eventId: string; participantId: string };
  const checkInData = checkInParticipantSchema.parse(req.body);

  if (!req.user?._id) {
    throw new ApiError(400, 'User ID is required', 'USER_ID_MISSING');
  }

  const updated = await ParticipantManagementService.checkInParticipant(
    new mongoose.Types.ObjectId(participantId),
    new mongoose.Types.ObjectId(eventId),
    checkInData,
    req.user._id,
  );

  res.status(200).json({
    success: true,
    message: 'Participant checked in successfully',
    data: updated,
  });
});

/**
 * Bulk check in participants
 */
export const bulkCheckIn = asyncHandler(async (req: OrganizationRequest, res) => {
  const { eventId } = req.params as { eventId: string };
  const checkInData = bulkCheckInSchema.parse(req.body);

  if (!req.user?._id) {
    throw new ApiError(400, 'User ID is required', 'USER_ID_MISSING');
  }

  const result = await ParticipantManagementService.bulkCheckIn(
    new mongoose.Types.ObjectId(eventId),
    checkInData,
    req.user._id,
  );

  res.status(200).json({
    success: true,
    message: 'Bulk check-in completed',
    data: result,
  });
});

/**
 * Bulk update participants
 */
export const bulkUpdateParticipants = asyncHandler(async (req: OrganizationRequest, res) => {
  const { eventId } = req.params as { eventId: string };
  const { participantIds, updateData } = bulkUpdateParticipantsSchema.parse(req.body);

  const result = await ParticipantManagementService.bulkUpdateParticipants(
    new mongoose.Types.ObjectId(eventId),
    participantIds,
    updateData,
  );

  res.status(200).json({
    success: true,
    message: 'Participants updated successfully',
    data: result,
  });
});

/**
 * Export participants list
 */
export const exportParticipants = asyncHandler(async (req: OrganizationRequest, res) => {
  const { eventId } = req.params as { eventId: string };
  const { format = 'csv' } = req.query;

  const exported = await ParticipantManagementService.exportParticipants(
    new mongoose.Types.ObjectId(eventId),
    (format as 'csv' | 'json') || 'csv',
  );

  if (format === 'csv') {
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="participants-${Date.now()}.csv"`);
  } else {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="participants-${Date.now()}.json"`);
  }

  res.send(exported);
});

/**
 * Get participant statistics
 */
export const getParticipantStats = asyncHandler(async (req: OrganizationRequest, res) => {
  const { eventId } = req.params as { eventId: string };

  const stats = await ParticipantManagementService.getParticipantStats(new mongoose.Types.ObjectId(eventId));

  res.status(200).json({
    success: true,
    message: 'Participant statistics retrieved successfully',
    data: stats,
  });
});
