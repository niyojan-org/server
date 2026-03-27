import ApiError from "@core/errors/api.error";
import { UserRepository } from "./user.repository";
import { userSelfDataUpdateSchema, UserSelfUpdateInput } from "./user.update.schema";

export const updateSelfUser = async (userId: string, input: UserSelfUpdateInput) => {
  const updateData = userSelfDataUpdateSchema.parse(input);
  if (Object.keys(updateData).length === 0) {
    throw new ApiError(400, "No fields provided for update", "USER_UPDATE_EMPTY");
  }

  const updatedUser = await UserRepository.updateById(userId, updateData);
  if (!updatedUser) {
    throw new ApiError(404, "User not found", "USER_NOT_FOUND");
  }

  return updatedUser;
};
