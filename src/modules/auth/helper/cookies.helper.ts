import type { Response } from 'express';
import env from '@config/env';

const COOKIE_NAME = '__Secure-refresh_token';

export const getCookieOptions = () => {
  return {
    httpOnly: true,
    secure: true, // Always use secure for cross-site cookies
    sameSite: 'none' as const,
    domain: `.${env.COOKIE_DOMAIN}`,
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    path: '/',
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

class CookkiesHelper {
  COOKIE_NAME = '__Secure-refresh_token';
  getCookieOptions = () => {
    return {
      httpOnly: true,
      secure: true, // Always use secure for cross-site cookies
      sameSite: 'none' as const,
      domain: `.${env.COOKIE_DOMAIN}`,
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      path: '/',
    };
  };
  setRefreshToken = (res: Response, token: string) => {
    res.cookie(COOKIE_NAME, token, getCookieOptions());
  };
  clearRefreshToken = (res: Response) => {
    res.clearCookie(COOKIE_NAME, getCookieOptions());
  };
  getRefreshToken = (req: { cookies: Record<string, string> }): string | null => {
    return req.cookies[COOKIE_NAME] || null;
  };
  setAcessToken = (res: Response, token: string) => {
    res.cookie('__Secure-access_token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      domain: `.${env.COOKIE_DOMAIN}`,
      maxAge: 10 * 60 * 1000, // 10 minutes,
      path: '/',
    });
  };
  getAccessToken = (req: { cookies: Record<string, string> }): string | null => {
    return req.cookies['__Secure-access_token'] || null;
  };
}

export default new CookkiesHelper();
