import ApiError from "@core/errors/api.error";
import { UserSecurityModel } from "./user-security.model";
import { UserSecurityDocument } from "./user-security.types";

export const getOrCreateUserSecurity = async (userId: string): Promise<UserSecurityDocument> => {
  let security: UserSecurityDocument | null = await UserSecurityModel.findOne({ userId });
  if (!security) {
    const newSecurity = new UserSecurityModel({ userId });
    await newSecurity.save();
    security = newSecurity;
  }
  return security!;
};

export const requireUserSecurity = async (userId: string): Promise<UserSecurityDocument> => {
  const security = await UserSecurityModel.findOne({ userId });
  if (!security) {
    throw new ApiError(
      404,
      "User security settings not found",
      "USER_SECURITY_NOT_FOUND",
      "We can not find security settings for your account. Please visit the security settings page to set up your security preferences."
    );
  }
  return security;
};
