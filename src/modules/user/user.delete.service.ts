import ApiError from "@core/errors/api.error";
import { UserRepository } from "./user.repository";
import { sendAuthEmail } from "@infra/mail";
// import { clearRefreshToken } from "@modules/auth/helper/cookies.helper";

export const deleteSelfUser = async (userId: string) => {
  const deletedUser = await UserRepository.deleteById(userId);

  if (!deletedUser) {
    throw new ApiError(404, "User not found", "USER_NOT_FOUND", "User does not exist..!!");
  }

  sendAuthEmail.accountDeleted(deletedUser.email, {
    name: deletedUser.name,
    deletionTime: new Date().toLocaleString(),
    supportUrl: "https://orgatick.in/support",
  });

  return deletedUser;
};
