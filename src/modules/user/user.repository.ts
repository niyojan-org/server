import { Types } from "mongoose";
import UserModel from "./user.model";
import { UserDocument } from "./user.types";

export class UserRepository {
  static async findById(id: string | Types.ObjectId) {
    return UserModel.findById(id).lean();
  }

  static async updateById(id: string | Types.ObjectId, update: Partial<UserDocument>) {
    return UserModel.findByIdAndUpdate(
      id,
      { $set: update },
      { returnDocument: "after", lean: true },
    );
  }

  static async deleteById(id: string | Types.ObjectId) {
    return UserModel.findByIdAndDelete(id).lean();
  }
}
