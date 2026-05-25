import mongoose from 'mongoose';
import { ParticipantModel, ParticipantDocument } from '@modules/participant/models/participant.model';
import { UpdateParticipantDto, UpdateParticipantStatusDto, CheckInParticipantDto, BulkCheckInDto } from '@modules/registration/dto/participant-management.dto';
import ParticipantRepository from '@modules/participant/repository/participant.repository';
import ApiError from '@core/errors/api.error';

export class ParticipantManagementService {
  /**
   * Get all participants for an event with filtering and pagination
   */
  static async getParticipantsByEvent(
    eventId: mongoose.Types.ObjectId,
    options?: {
      page?: number;
      limit?: number;
      status?: string;
      search?: string;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
    },
  ) {
    const page = options?.page || 1;
    const limit = options?.limit || 10;
    const skip = (page - 1) * limit;

    const query: Record<string, unknown> = { eventId };

    if (options?.status) {
      query.status = options.status;
    }

    if (options?.search) {
      query.$or = [
        { name: { $regex: options.search, $options: 'i' } },
        { email: { $regex: options.search, $options: 'i' } },
        { phone: { $regex: options.search, $options: 'i' } },
      ];
    }

    const sortBy = options?.sortBy || 'createdAt';
    const sortOrder = options?.sortOrder === 'asc' ? 1 : -1;

    const [participants, total] = await Promise.all([
      ParticipantModel.find(query)
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      ParticipantModel.countDocuments(query),
    ]);

    return {
      data: participants,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get single participant details
   */
  static async getParticipantById(
    participantId: mongoose.Types.ObjectId,
    eventId: mongoose.Types.ObjectId,
  ): Promise<ParticipantDocument> {
    const participant = await ParticipantModel.findOne({
      _id: participantId,
      eventId,
    }).exec();

    if (!participant) {
      throw new ApiError(
        404,
        'Participant not found',
        'PARTICIPANT_NOT_FOUND',
        'The requested participant does not exist in this event',
      );
    }

    return participant;
  }

  /**
   * Update participant information
   */
  static async updateParticipant(
    participantId: mongoose.Types.ObjectId,
    eventId: mongoose.Types.ObjectId,
    updateData: UpdateParticipantDto,
  ): Promise<ParticipantDocument> {
    const participant = await this.getParticipantById(participantId, eventId);

    // Check for email uniqueness if email is being updated
    if (updateData.email && updateData.email !== participant.email) {
      const existingParticipant = await ParticipantModel.findOne({
        eventId,
        email: updateData.email,
        _id: { $ne: participantId },
      }).exec();

      if (existingParticipant) {
        throw new ApiError(
          409,
          'Email already exists',
          'EMAIL_ALREADY_EXISTS',
          'Another participant is already registered with this email address',
        );
      }
    }

    const updated = await ParticipantRepository.updateParticipant(
      participantId,
      updateData as any,
    );

    if (!updated) {
      throw new ApiError(
        500,
        'Failed to update participant',
        'UPDATE_FAILED',
        'Could not update participant information',
      );
    }

    return updated;
  }

  /**
   * Update participant status
   */
  static async updateParticipantStatus(
    participantId: mongoose.Types.ObjectId,
    eventId: mongoose.Types.ObjectId,
    statusData: UpdateParticipantStatusDto,
  ): Promise<ParticipantDocument> {
    const participant = await this.getParticipantById(participantId, eventId);

    const updated = await ParticipantRepository.updateParticipant(participantId, {
      status: statusData.status as any,
    });

    if (!updated) {
      throw new ApiError(
        500,
        'Failed to update participant status',
        'STATUS_UPDATE_FAILED',
        'Could not update participant status',
      );
    }

    return updated;
  }

  /**
   * Delete participant
   */
  static async deleteParticipant(
    participantId: mongoose.Types.ObjectId,
    eventId: mongoose.Types.ObjectId,
  ): Promise<void> {
    const participant = await this.getParticipantById(participantId, eventId);

    await ParticipantModel.findByIdAndDelete(participantId).exec();
  }

  /**
   * Check in a participant
   */
  static async checkInParticipant(
    participantId: mongoose.Types.ObjectId,
    eventId: mongoose.Types.ObjectId,
    checkInData: CheckInParticipantDto,
    userId: mongoose.Types.ObjectId,
  ): Promise<ParticipantDocument> {
    const participant = await this.getParticipantById(participantId, eventId);

    const sessionCheckInData = {
      sessionId: checkInData.sessionId ? new mongoose.Types.ObjectId(checkInData.sessionId) : new mongoose.Types.ObjectId(),
      checkedIn: true,
      checkedInAt: new Date(),
      checkedInBy: userId,
    };

    // Use the $push operator to safely add to array
    const updated = await ParticipantModel.findByIdAndUpdate(
      participantId,
      {
        $push: { sessionCheckIns: sessionCheckInData },
        $set: { status: 'CHECKED_IN' },
      },
      { new: true },
    ).exec();

    if (!updated) {
      throw new ApiError(
        500,
        'Failed to check in participant',
        'CHECKIN_FAILED',
        'Could not check in participant',
      );
    }

    return updated;
  }

  /**
   * Bulk check in participants
   */
  static async bulkCheckIn(
    eventId: mongoose.Types.ObjectId,
    checkInData: BulkCheckInDto,
    userId: mongoose.Types.ObjectId,
  ): Promise<{ succeeded: number; failed: number; errors: Record<string, string> }> {
    const participantIds = checkInData.participantIds.map(
      (id: string) => new mongoose.Types.ObjectId(id),
    );

    const sessionCheckIn = {
      sessionId: checkInData.sessionId ? new mongoose.Types.ObjectId(checkInData.sessionId) : new mongoose.Types.ObjectId(),
      checkedIn: true,
      checkedInAt: new Date(),
      checkedInBy: userId,
    };

    const result = await ParticipantModel.updateMany(
      { _id: { $in: participantIds }, eventId },
      {
        $push: { sessionCheckIns: sessionCheckIn },
        $set: { status: 'CHECKED_IN' },
      },
    ).exec();

    return {
      succeeded: result.modifiedCount,
      failed: checkInData.participantIds.length - result.modifiedCount,
      errors: {},
    };
  }

  /**
   * Bulk update participants
   */
  static async bulkUpdateParticipants(
    eventId: mongoose.Types.ObjectId,
    participantIds: string[],
    updateData: UpdateParticipantDto,
  ): Promise<{ succeeded: number; failed: number }> {
    const objectIds = participantIds.map((id) => new mongoose.Types.ObjectId(id));

    const result = await ParticipantModel.updateMany(
      { _id: { $in: objectIds }, eventId },
      { $set: updateData },
    ).exec();

    return {
      succeeded: result.modifiedCount,
      failed: participantIds.length - result.modifiedCount,
    };
  }

  /**
   * Export participants list
   */
  static async exportParticipants(
    eventId: mongoose.Types.ObjectId,
    format: 'csv' | 'json' = 'csv',
  ): Promise<string> {
    const participants = await ParticipantModel.find({ eventId }).lean().exec();

    if (format === 'json') {
      return JSON.stringify(participants, null, 2);
    }

    // CSV format
    if (participants.length === 0) {
      return 'No participants found';
    }

    const headers = ['Name', 'Email', 'Phone', 'Status', 'Created At', 'Checked In'];
    const rows = participants.map((p) => [
      p.name,
      p.email,
      p.phone,
      p.status,
      p.createdAt?.toISOString() || '',
      p.sessionCheckIns && p.sessionCheckIns.length > 0 ? 'Yes' : 'No',
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    return csvContent;
  }

  /**
   * Get participant statistics for an event
   */
  static async getParticipantStats(eventId: mongoose.Types.ObjectId) {
    const stats = await ParticipantModel.aggregate([
      { $match: { eventId } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]).exec();

    const checkedInCount = await ParticipantModel.countDocuments({
      eventId,
      'sessionCheckIns.0': { $exists: true },
    }).exec();

    const totalCount = await ParticipantModel.countDocuments({ eventId }).exec();

    return {
      total: totalCount,
      byStatus: stats.reduce(
        (acc, stat) => ({ ...acc, [stat._id]: stat.count }),
        {},
      ),
      checkedIn: checkedInCount,
      notCheckedIn: totalCount - checkedInCount,
      checkInPercentage: totalCount > 0 ? ((checkedInCount / totalCount) * 100).toFixed(2) : 0,
    };
  }
}
