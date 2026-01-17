import UserModel from "@modules/user/user.model";
import { RegisterInput } from "../schemas/register.schema";
import ApiError from "@core/errors/api.error";
import { sendVerificationEmail } from "./verification.service";

function generateFallbackAvatar(name: string): string {
  return `https://api.dicebear.com/9.x/shapes/png?seed=${name.replace(/\s+/g, "")}`;
}

export const register = async (input: RegisterInput) => {
  const exists = await UserModel.findOne({ email: input.email });
  if (exists) {
    throw new ApiError(
      409,
      "Email already in use",
      "EMAIL_IN_USE",
      "The provided email address is already registered."
    );
  }
  const user = await UserModel.create({
    email: input.email,
    name: input.name,
    password: input.password,
    gender: input.gender,
    avatar: input.avatar || generateFallbackAvatar(input.name),
    isVerified: false,
  });
  await sendVerificationEmail(user);
  return { userId: user._id, email: user.email, name: user.name, avatar: user.avatar };
};
