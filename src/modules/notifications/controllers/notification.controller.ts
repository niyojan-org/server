import { asyncHandler } from '@core/utils/asyncHandler';
import { AuthenticatedRequest } from '@core/middlewares/auth.middleware';
import * as notificationService from '../service/notification.query.service';
import * as createService from '../service/notification.create.service';
import {
  createNotificationSchema,
  markAsReadSchema,
  getNotificationsQuerySchema,
} from '../schema/notification.schema';

export const getNotifications = asyncHandler(
  async (req: AuthenticatedRequest, res) => {
    const userId = req.user!._id.toString();

    // Validate query params
    const validatedQuery = getNotificationsQuerySchema.parse(req.query);

    const result = await notificationService.getUserNotifications({
      userId,
      limit: validatedQuery.limit,
      offset: validatedQuery.offset,
      unreadOnly: validatedQuery.unreadOnly,
      category: validatedQuery.category,
      type: validatedQuery.type,
    });
    res.status(200).json({
      success: true,
      data: result,
    });
  },
);

export const getNotificationStats = asyncHandler(
  async (req: AuthenticatedRequest, res) => {
    const userId = req.user!._id.toString();

    const stats = await notificationService.getNotificationStats(userId);

    res.status(200).json({
      success: true,
      data: stats,
    });
  },
);

export const markAsRead = asyncHandler(
  async (req: AuthenticatedRequest, res) => {
    const userId = req.user!._id.toString();
    // Validate request body
    const validatedBody = markAsReadSchema.parse(req.body);
    await notificationService.markAsRead(userId, validatedBody.notificationIds);
    res.status(200).json({
      success: true,
      message: 'Notifications marked as read',
    });
  },
);

export const markAllAsRead = asyncHandler(
  async (req: AuthenticatedRequest, res) => {
    const userId = req.user!._id.toString();

    const result = await notificationService.markAllAsRead(userId);

    res.status(200).json({
      success: true,
      message: `${result.updatedCount} notifications marked as read`,
      data: result,
    });
  },
);

export const archiveNotification = asyncHandler(
  async (req: AuthenticatedRequest, res) => {
    const userId = req.user!._id.toString();
    const { notificationId } = req.params;

    if (!notificationId || typeof notificationId !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Invalid notification ID',
      });
    }

    await notificationService.archiveNotification(userId, notificationId);

    res.status(200).json({
      success: true,
      message: 'Notification archived',
    });
  },
);

// Delete all read notifications
export const deleteReadNotifications = asyncHandler(
  async (req: AuthenticatedRequest, res) => {
    const userId = req.user!._id.toString();

    const result = await notificationService.deleteReadNotifications(userId);

    res.status(200).json({
      success: true,
      message: `${result.deletedCount} read notifications deleted`,
      data: result,
    });
  },
);

// Delete all notifications (clear all)
export const deleteAllNotifications = asyncHandler(
  async (req: AuthenticatedRequest, res) => {
    const userId = req.user!._id.toString();

    const result = await notificationService.deleteAllNotifications(userId);

    res.status(200).json({
      success: true,
      message: `${result.deletedCount} notifications deleted`,
      data: result,
    });
  },
);

// Admin/System endpoint for creating notifications
export const createNotification = asyncHandler(
  async (req: AuthenticatedRequest, res) => {
    // Validate request body
    const validatedPayload = createNotificationSchema.parse(req.body);

    const result = await createService.createNotification(validatedPayload);

    res.status(201).json({
      success: true,
      message: 'Notification created successfully',
      data: result,
    });
  },
);
