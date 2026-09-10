import { Request, Response, NextFunction } from 'express';
import * as notificationService from '../services/notification.service';

export const getMyNotifications = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user!.userId;
    const notifications =
      await notificationService.getUserNotifications(userId);

    res.status(200).json({ data: notifications });
  } catch (error) {
    next(error);
  }
};

export const markNotificationAsRead = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user!.userId;

    if (!notificationId) {
      return res.status(400).json({ message: 'Notification ID is required' });
    }

    const notification = await notificationService.markAsRead(
      notificationId,
      userId,
    );

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.status(200).json({ message: 'Marked as read', data: notification });
  } catch (error) {
    next(error);
  }
};

export const markAllNotificationsAsRead = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user!.userId;
    await notificationService.markAllAsRead(userId);

    res.status(200).json({ message: 'Marked all as read successfully' });
  } catch (error) {
    next(error);
  }
};
