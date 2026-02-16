import { Router } from "express";
import { authenticate } from "@core/middlewares/auth.middleware";
import { isTaskMaster } from "@core/middlewares/taskmaster.middleware";
import * as notificationController from "../controllers/notification.controller";
import * as preferencesController from "../controllers/preferences.controller";

const notificationRoutes = Router();

// All notification routes require authentication
notificationRoutes.use(authenticate);

// Notification endpoints
notificationRoutes.get("/", notificationController.getNotifications);
notificationRoutes.get("/stats", notificationController.getNotificationStats);
notificationRoutes.post("/read", notificationController.markAsRead);
notificationRoutes.post("/read-all", notificationController.markAllAsRead);
notificationRoutes.post("/:notificationId/archive", notificationController.archiveNotification);
notificationRoutes.delete("/read", notificationController.deleteReadNotifications);
notificationRoutes.delete("/clear-all", notificationController.deleteAllNotifications);

// Preferences endpoints
notificationRoutes.get("/preferences", preferencesController.getPreferences);
notificationRoutes.put("/preferences", preferencesController.updatePreferences);

// Push token endpoints
notificationRoutes.post("/push-tokens", preferencesController.registerPushToken);
notificationRoutes.get("/push-tokens", preferencesController.getPushTokens);
notificationRoutes.delete("/push-tokens", preferencesController.deactivatePushToken);

// Admin/TaskMaster endpoints
notificationRoutes.post("/send", isTaskMaster(), notificationController.createNotification);

export default notificationRoutes;
