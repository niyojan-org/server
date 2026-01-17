import type { Response } from "express";
import env from "@config/env";

const COOKIE_NAME = "refresh_token";

export const getCookieOptions = () => {
  const isProduction = env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure: true, // Always use secure for cross-site cookies
    sameSite: "none" as const,
    domain: isProduction ? env.COOKIE_DOMAIN : undefined,
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    path: "/",
  };
};

export const setRefreshToken = (res: Response, token: string) => {
  res.cookie(COOKIE_NAME, token, getCookieOptions());
};

export const clearRefreshToken = (res: Response) => {
  res.clearCookie(COOKIE_NAME, getCookieOptions());
};

export const getRefreshToken = (req: { cookies: Record<string, string> }): string | null => {
  return req.cookies[COOKIE_NAME] || null;
};
