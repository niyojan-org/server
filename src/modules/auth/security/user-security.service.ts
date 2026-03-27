import { UserSecurityModel } from "./user-security.model";
import { UserSecurityDocument } from "./user-security.types";
import UserModel from "@modules/user/user.model";

export const getOrCreateUserSecurity = async (email: string): Promise<UserSecurityDocument> => {
  let security: UserSecurityDocument | null = await UserSecurityModel.findOne({ email });
  if (!security) {
    const user = await UserModel.findOne({ email }).select("_id").lean();
    if (!user) {
      throw new Error("Check email existence before creating security document");
    }
    const isExistingSecurity = await UserSecurityModel.findOne({ userId: user._id });
    if (isExistingSecurity) {
      return isExistingSecurity;
    }
    const newSecurity = new UserSecurityModel({ userId: user._id, email });
    await newSecurity.save();
    security = newSecurity;
  }
  return security!;
};
