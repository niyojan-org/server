import UserModel from "@modules/user/user.model";

export interface OAuthProfile {
  provider: string;
  providerId: string;
  email: string;
  name: string;
  avatar?: string;
  emailVerified?: boolean;
}

const findOrCreateOAuthUser = async (profile: OAuthProfile) => {
  let user = await UserModel.findOne({
    provider: profile.provider,
    providerId: profile.providerId,
  });
  if (user) return user;
  user = await UserModel.findOne({ email: profile.email });
  if (user) {
    user.provider = profile.provider as any;
    user.providerId = profile.providerId;
    if (profile.emailVerified) {
      user.isVerified = true;
    }
    await user.save();
    return user;
  }
  user = await UserModel.create({
    name: profile.name,
    email: profile.email,
    avatar: profile.avatar,
    provider: profile.provider as any,
    providerId: profile.providerId,
    isVerified: profile.emailVerified || false,
  });
  return user;
};

export default findOrCreateOAuthUser;
