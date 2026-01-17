import env from "@config/env";
import ApiError from "@core/errors/api.error";
import axios from "axios";
import findOrCreateOAuthUser, { OAuthProfile } from "./oauth.service";
import { Request, Response } from "express";
import { resolveRedirect } from "../utils/redirect";

interface GoogleTokenResponse {
  access_token: string;
  id_token: string;
}

interface GoogleUserProfile {
  sub: string;
  email: string;
  email_verified: boolean;
  name: string;
  picture?: string;
}

export const redirectToGoogleOAuth = (req: Request) => {
  const redirectIntent = req.query.redirect as string | undefined;
  const safeRedirect = resolveRedirect(redirectIntent);
  const state = safeRedirect
    ? Buffer.from(JSON.stringify({ redirect: redirectIntent })).toString("base64")
    : undefined;

  const params = new URLSearchParams({
    client_id: env.GOOGLE_CLIENT_ID,
    redirect_uri: env.GOOGLE_CALLBACK_URL,
    response_type: "code",
    scope: "openid email profile",
    prompt: "select_account",
    ...(state && { state }),
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
};

export const authenticateWithGoogle = async (code: string) => {
  const tokenRes = await axios.post<GoogleTokenResponse>("https://oauth2.googleapis.com/token", {
    code,
    client_id: env.GOOGLE_CLIENT_ID,
    client_secret: env.GOOGLE_CLIENT_SECRET,
    redirect_uri: env.GOOGLE_CALLBACK_URL,
    grant_type: "authorization_code",
  });
  if (!tokenRes.data?.id_token) {
    throw new ApiError(
      400,
      "Google authentication failed",
      "GOOGLE_OAUTH_FAILED",
      "No ID token received from Google"
    );
  }
  const profileRes = await axios.get<GoogleUserProfile>(
    "https://www.googleapis.com/oauth2/v3/userinfo",
    {
      headers: {
        Authorization: `Bearer ${tokenRes.data.access_token}`,
      },
    }
  );
  if (!profileRes.data?.sub) {
    throw new ApiError(
      400,
      "Google authentication failed",
      "GOOGLE_OAUTH_FAILED",
      "No user profile received from Google"
    );
  }
  const profile: OAuthProfile = {
    provider: "google",
    providerId: profileRes.data.sub,
    email: profileRes.data.email,
    name: profileRes.data.name,
    avatar: profileRes.data.picture,
    emailVerified: profileRes.data.email_verified,
  };
  const user = await findOrCreateOAuthUser(profile);
  return user;
};

export default authenticateWithGoogle;
