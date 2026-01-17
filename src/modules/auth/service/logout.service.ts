import { Response } from "express";
import { destroySession } from "./session.service";
import { clearRefreshToken } from "../helper/cookies.helper";
export const logout = async (userId: string, res: Response) => {
  await destroySession(userId);
  clearRefreshToken(res);
};
