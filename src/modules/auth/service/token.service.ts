import env from "@config/env";
import ApiError from "@core/errors/api.error";
import jwt, { SignOptions } from "jsonwebtoken";

export interface TokenPayload {
  userId: string;
  sessionId: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export const generateTokens = (payload: TokenPayload): TokenPair => {
  const cleanPayload: TokenPayload = {
    userId: payload.userId,
    sessionId: payload.sessionId,
  };

  const accessToken = jwt.sign(cleanPayload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_TOKEN_EXPIRY,
  } as SignOptions);

  const refreshToken = jwt.sign(cleanPayload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_TOKEN_EXPIRY,
  } as SignOptions);
  return { accessToken, refreshToken };
};

export const verifyAccessToken = (token: string): TokenPayload => {
  try {
    return jwt.verify(token, env.JWT_ACCESS_SECRET) as TokenPayload;
  } catch (error) {
    throw new ApiError(
      401,
      "Invalid or expired token",
      "INVALID_ACCESS_TOKEN",
      "Invalide or expired token need to re-authenticate"
    );
  }
};

export const verifyRefreshToken = (token: string): TokenPayload => {
  try {
    return jwt.verify(token, env.JWT_REFRESH_SECRET) as TokenPayload;
  } catch (error) {
    throw new ApiError(
      401,
      "Invalid or expired token",
      "TOKEN_SERVICE",
      "Invalide or expired refresh token need to re-authenticate"
    );
  }
};
