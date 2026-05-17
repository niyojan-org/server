import mongoose from 'mongoose';
import { ParticipantModel } from '../models/participant.model';
import { CreateParticipantDto, Participant } from '../types/participant.types';

class ParticipantRepository {
  static async addParticipant(payload: CreateParticipantDto, session?: mongoose.ClientSession) {
    const participant = new ParticipantModel(payload);
    await participant.save({ session });
    return participant;
  }
  static async addParticipants(payload: CreateParticipantDto[], session?: mongoose.ClientSession) {
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

  static async getParticipantById(participantId: mongoose.Types.ObjectId) {
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
