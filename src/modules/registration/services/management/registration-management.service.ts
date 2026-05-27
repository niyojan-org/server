import mongoose from 'mongoose';
import { RegistrationModel, RegistrationDocument } from '@modules/registration/models/registration.model';
import {
  UpdateRegistrationDto,
  UpdateRegistrationStatusDto,
  RegistrationListQueryDto,
} from '@modules/registration/dto/registration-management.dto';
import ApiError from '@core/errors/api.error';
// import ParticipantRepository from '@modules/participant/repository/participant.repository';
import RegistrationRepository from '@modules/registration/repository/registration.repository';

export class RegistrationManagementService {
  // Get all registrations for an event with filtering and pagination
  static async getRegistrationsByEvent(eventId: mongoose.Types.ObjectId, options: RegistrationListQueryDto) {
    const data = await RegistrationRepository.getRegistrationByEvent(eventId, options);
    return data;
  }

  /**
   * Get single registration details
   */
  static async getRegistrationById(
    registrationId: mongoose.Types.ObjectId,
    eventId: mongoose.Types.ObjectId,
  ): Promise<RegistrationDocument> {
    const registration = await RegistrationModel.findOne({
      _id: registrationId,
      eventId,
    })
      .populate('participantIds')
      .populate('ticketId')
      .exec();

    if (!registration) {
      throw new ApiError(
        404,
        'Registration not found',
        'REGISTRATION_NOT_FOUND',
        'The requested registration does not exist',
      );
    }

    return registration;
  }

  /**
   * Update registration information
   */
  static async updateRegistration(
    registrationId: mongoose.Types.ObjectId,
    eventId: mongoose.Types.ObjectId,
    updateData: UpdateRegistrationDto,
  ): Promise<RegistrationDocument> {
    // const registration = await this.getRegistrationById(registrationId, eventId);

    const updated = await RegistrationModel.findByIdAndUpdate(registrationId, { $set: updateData }, { new: true })
      .populate('participantIds')
      .populate('ticketId')
      .exec();

    if (!updated) {
      throw new ApiError(
        500,
        'Failed to update registration',
        'UPDATE_FAILED',
        'Could not update registration information',
      );
    }

    return updated;
  }

  /**
   * Update registration status
   */
  static async updateRegistrationStatus(
    registrationId: mongoose.Types.ObjectId,
    eventId: mongoose.Types.ObjectId,
    statusData: UpdateRegistrationStatusDto,
  ): Promise<RegistrationDocument> {
    // const registration = await this.getRegistrationById(registrationId, eventId);

    const updated = await RegistrationModel.findByIdAndUpdate(
      registrationId,
      { $set: { status: statusData.status } },
      { new: true },
    )
      .populate('participantIds')
      .populate('ticketId')
      .exec();

    if (!updated) {
      throw new ApiError(
        500,
        'Failed to update registration status',
        'STATUS_UPDATE_FAILED',
        'Could not update registration status',
      );
    }

    return updated;
  }

  /**
   * Delete registration
   */
  // static async deleteRegistration(
  //   registrationId: mongoose.Types.ObjectId,
  //   eventId: mongoose.Types.ObjectId,
  // ): Promise<void> {
  //   // const registration = await this.getRegistrationById(registrationId, eventId);

  //   // // Delete all associated participants
  //   // if (registration.participantIds && registration.participantIds.length > 0) {
  //   //   await Promise.all(
  //   //     (registration.participantIds as any[]).map((participantId) =>
  //   //       ParticipantRepository.updateParticipant(participantId._id, { status: 'CANCELLED' as any }),
  //   //     ),
  //   //   );
  //   // }

  //   await RegistrationModel.findByIdAndDelete(registrationId).exec();
  // }

  /**
   * Resend registration details to participants
   */
  // static async resendRegistrationDetails(
  //   registrationId: mongoose.Types.ObjectId,
  //   eventId: mongoose.Types.ObjectId,
  //   channels: string[],
  // ): Promise<{ succeeded: number; failed: number }> {
  //   const registration = await this.getRegistrationById(registrationId, eventId);

  //   if (!registration.participantIds || registration.participantIds.length === 0) {
  //     throw new ApiError(
  //       400,
  //       'No participants in this registration',
  //       'NO_PARTICIPANTS',
  //       'Cannot resend details when there are no participants',
  //     );
  //   }

  //   // In a real implementation, you would queue email/SMS/WhatsApp jobs
  //   // For now, we'll just update the notification flags
  //   let succeeded = 0;
  //   let failed = 0;

  //   for (const participantId of registration.participantIds as any[]) {
  //     try {
  //       await ParticipantRepository.updateParticipant(participantId._id, {
  //         notifications: {
  //           emailSent: channels.includes('email'),
  //           whatsAppSent: channels.includes('whatsapp'),
  //         },
  //       } as any);
  //       succeeded++;
  //     } catch {
  //       failed++;
  //     }
  //   }

  //   return { succeeded, failed };
  // }

  /**
   * Get registration statistics
   */
  static async getRegistrationStats(eventId: mongoose.Types.ObjectId) {
    const stats = await RegistrationModel.aggregate([
      { $match: { eventId } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$pricing.total' },
        },
      },
    ]).exec();

    const totalRegistrations = await RegistrationModel.countDocuments({
      eventId,
    }).exec();

    const totalParticipants = await RegistrationModel.aggregate([
      { $match: { eventId } },
      { $group: { _id: null, total: { $sum: '$participantsCount' } } },
    ]).exec();

    return {
      totalRegistrations,
      totalParticipants: totalParticipants[0]?.total || 0,
      byStatus: stats.reduce(
        (acc, stat) => ({
          ...acc,
          [stat._id]: { count: stat.count, totalAmount: stat.totalAmount },
        }),
        {},
      ),
    };
  }

  /**
   * Export registrations list
   */
  static async exportRegistrations(eventId: mongoose.Types.ObjectId, format: 'csv' | 'json' = 'csv'): Promise<string> {
    const registrations = await RegistrationModel.find({ eventId })
      .populate('participantIds')
      .populate('ticketId')
      .lean()
      .exec();

    if (format === 'json') {
      return JSON.stringify(registrations, null, 2);
    }

    // CSV format
    if (registrations.length === 0) {
      return 'No registrations found';
    }

    const headers = ['Group Name', 'Status', 'Participants Count', 'Total Amount', 'Currency', 'Created At'];
    const rows = registrations.map((r) => [
      r.groupInfo?.groupName || 'N/A',
      r.status,
      r.participantsCount,
      r.pricing?.total || 0,
      r.pricing?.currency || 'INR',
      r.createdAt?.toISOString() || '',
    ]);

    const csvContent = [headers.join(','), ...rows.map((row) => row.map((cell) => `"${cell}"`).join(','))].join('\n');

    return csvContent;
  }
}
