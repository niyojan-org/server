import mongoose from 'mongoose';
import { CreateRegistrationDto } from '../dto/create-registration.dto';
import { RegistrationDocument, RegistrationModel } from '../models/registration.model';
import { RegistrationPricing } from '../interfaces/registration.interface';
import { RegistrationStatus } from '../constants/registration.constants';
import { ObjectId } from '@helpers/zod';
import { RegistrationListQueryDto } from '../dto/registration-management.dto';
import { buildRegistrationPaginationQuery } from '../helpers/registration-pagination.helper';
import { PaginationResponse } from '@helpers/pagination.helper';

class RegistrationRepository {
  static async createRegistration(
    payload: CreateRegistrationDto,
    pricing: RegistrationPricing,
    session?: mongoose.ClientSession,
  ): Promise<RegistrationDocument> {
    const data = new RegistrationModel({
      eventId: payload.eventId,
      ticketId: payload.ticketId,
      participantsCount: payload.participants.length,
      status: RegistrationStatus.DRAFT,
      pricing,
      groupInfo: payload.groupInfo
        ? {
            groupName: payload.groupInfo.groupName,
            totalMembers: payload.participants.length,
          }
        : undefined,
    });
    const registration = await data.save({ session });
    return registration;
  }

  static async findById(id: ObjectId): Promise<RegistrationDocument | null> {
    return RegistrationModel.findById(id).exec();
  }

  /**
   * Get registrations for an event with pagination, filtering, and sorting
   */
  static async getRegistrationByEvent(
    eventId: ObjectId,
    options: RegistrationListQueryDto,
  ): Promise<PaginationResponse<RegistrationDocument>> {
    const paginationQuery = buildRegistrationPaginationQuery(options);
    const query = { eventId, ...paginationQuery.query };
    const data = await RegistrationModel.paginate(query, { ...paginationQuery.options });
    return {
      docs: data.docs,
      totalDocs: data.totalDocs,
      limit: data.limit,
      page: data.page ?? 1,
      totalPages: data.totalPages,
      hasNextPage: data.hasNextPage ?? false,
      hasPrevPage: data.hasPrevPage ?? false,
    };
  }
}

export default RegistrationRepository;
