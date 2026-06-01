import mongoose from 'mongoose';
import { ParticipantDocument, ParticipantModel } from '../models/participant.model';
import { CreateParticipantDto, Participant } from '../types/participant.types';
import { IdGeneratorHelper } from '@modules/registration/helpers/id-generator.helper';
import { RegistrationModel } from '@modules/registration/models/registration.model';

class ParticipantRepository {
  static async addParticipant(payload: CreateParticipantDto, session?: mongoose.ClientSession) {
    // Generate participant ID if not provided
    if (!payload.participantId) {
      const registration = await RegistrationModel.findById(payload.registrationId).select('registrationId').exec();
      const registrationIdBase = registration?.registrationId;
      
      if (registrationIdBase) {
        const participantCount = await ParticipantModel.countDocuments({ registrationId: payload.registrationId }).exec();
        payload.participantId = IdGeneratorHelper.generateFullId(registrationIdBase, participantCount + 1);
      }
    }
    
    const participant = new ParticipantModel(payload);
    await participant.save({ session });
    return participant;
  }

  static async addParticipants(payload: CreateParticipantDto[], session?: mongoose.ClientSession) {
    // Generate participant IDs for all participants
    if (payload.length > 0) {
      const registration = await RegistrationModel.findById(payload[0].registrationId).select('registrationId').exec();
      const registrationIdBase = registration?.registrationId;
      
      if (registrationIdBase) {
        const existingCount = await ParticipantModel.countDocuments({ registrationId: payload[0].registrationId }).exec();
        
        payload.forEach((participant, index) => {
          if (!participant.participantId) {
            participant.participantId = IdGeneratorHelper.generateFullId(registrationIdBase, existingCount + index + 1);
          }
        });
      }
    }
    
    const participants = await ParticipantModel.insertMany(payload, {
      session,
    });
    return participants;
  }

  static async getParticipantsByRegistrationId(registrationId: mongoose.Types.ObjectId) {
    return ParticipantModel.find({ registrationId }).exec();
  }

  static async getParticipantsByEventId(eventId: mongoose.Types.ObjectId) {
    return ParticipantModel.find({ eventId }).exec();
  }

  static async getParticipantById(
    participantId: mongoose.Types.ObjectId,
  ): Promise<ParticipantDocument | null> {
    return ParticipantModel.findById(participantId).exec();
  }

  static async updateParticipant(
    participantId: mongoose.Types.ObjectId,
    updateData: Partial<Participant>,
    session?: mongoose.ClientSession,
  ) {
    return ParticipantModel.findByIdAndUpdate(participantId, updateData, {
      new: true,
      session,
    }).exec();
  }
}

export default ParticipantRepository;
