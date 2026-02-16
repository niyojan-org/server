import { asyncHandler } from "@core/utils/asyncHandler";
import { AuthenticatedRequest } from "@core/middlewares/auth.middleware";
import * as preferencesService from "../service/preferences.service";
import * as pushTokenService from "../service/push-token.service";
import { updatePreferencesSchema, registerPushTokenSchema } from "../schema/notification.schema";

export const getPreferences = asyncHandler(async (req: AuthenticatedRequest, res) => {
  const userId = req.user!._id.toString();

  const preferences = await preferencesService.getUserPreferences(userId);

  res.status(200).json({
    success: true,
    data: preferences,
  });
});

export const updatePreferences = asyncHandler(async (req: AuthenticatedRequest, res) => {
  const userId = req.user!._id.toString();
  
  // Validate request body
  const validatedPayload = updatePreferencesSchema.parse(req.body);

  const updated = await preferencesService.updateUserPreferences(userId, validatedPayload);

  res.status(200).json({
    success: true,
    message: "Preferences updated successfully",
    data: updated,
  });
});

export const registerPushToken = asyncHandler(async (req: AuthenticatedRequest, res) => {
  const userId = req.user!._id.toString();
  
  // Validate request body
  const validatedPayload = registerPushTokenSchema.parse(req.body);

  const pushToken = await pushTokenService.registerPushToken(userId, validatedPayload);

  res.status(201).json({
    success: true,
    message: "Push token registered successfully",
    data: pushToken,
  });
});

export const getPushTokens = asyncHandler(async (req: AuthenticatedRequest, res) => {
  const userId = req.user!._id.toString();

  const tokens = await pushTokenService.getUserPushTokens(userId);

  res.status(200).json({
    success: true,
    data: tokens,
  });
});

export const deactivatePushToken = asyncHandler(async (req: AuthenticatedRequest, res) => {
  const userId = req.user!._id.toString();
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({
      success: false,
      message: "token is required",
    });
  }

  await pushTokenService.deactivatePushToken(userId, token);

  res.status(200).json({
    success: true,
    message: "Push token deactivated",
  });
});
