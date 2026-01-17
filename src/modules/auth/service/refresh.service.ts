import ApiError from "@core/errors/api.error";
import { generateTokens, verifyRefreshToken } from "./token.service";
import { validateSession } from "./session.service";

export const refreshAccessToken = async (refreshToken: string) => {
  if (!refreshToken) {
    throw new ApiError(400, "Token is required", "TOKEN_REQUIRED", "Refresh token not provided");
  }
  const payload = verifyRefreshToken(refreshToken);
  await validateSession(payload.userId, payload.sessionId);
  const { accessToken } = generateTokens(payload);
  return accessToken;
};
