import mongoose from 'mongoose';
import { CreateRegistrationDto } from '../dto/create-registration.dto';
import {
  RegistrationDocument,
  RegistrationModel,
} from '../models/registration.model';
import { RegistrationPricing } from '../interfaces/registration.interface';
import { RegistrationStatus } from '../constants/registration.constants';

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
}

export default RegistrationRepository;
