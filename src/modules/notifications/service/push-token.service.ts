import * as pushTokenRepository from "../persistence/push-token.repository";
import { RegisterPushTokenPayload } from "../types/preferences.types";

export async function registerPushToken(userId: string, payload: RegisterPushTokenPayload) {
  return pushTokenRepository.registerPushToken(userId, payload);
}

export async function getUserPushTokens(userId: string) {
  return pushTokenRepository.getUserPushTokens(userId);
}

export async function getActivePushTokens(userId: string) {
  return pushTokenRepository.getActivePushTokens(userId);
}

export async function deactivatePushToken(userId: string, token: string) {
  return pushTokenRepository.deactivatePushToken(userId, token);
}

export async function deactivatePushTokens(tokens: string[]) {
  return pushTokenRepository.deactivatePushTokens(tokens);
}
