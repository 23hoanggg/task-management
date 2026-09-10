import { Notification, INotification } from '../models/notification.model';
import { io } from '../server';

export const createNotification = async (data: {
  userId: string;
  title: string;
  content: string;
  targetUrl?: string;
  type: 'mention' | 'task_assigned' | 'board_invite' | 'deadline' | 'system';
  invitationId?: string;
  boardId?: string;
}) => {
  const notification = await Notification.create(data);

  // phát noti đến người dùng qua socket
  io.to(`user:${data.userId}`).emit('notification:new', notification);

  return notification;
};

export const getUserNotifications = async (userId: string) => {
  const notifications = await Notification.find({ userId })
    .sort({ createdAt: -1 })
    .limit(50);
  return notifications;
};

export const markAsRead = async (notificationId: string, userId: string) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: notificationId, userId },
    { isRead: true },
    { new: true },
  );
  return notification;
};

export const markAllAsRead = async (userId: string) => {
  const result = await Notification.updateMany(
    { userId, isRead: false },
    { isRead: true },
  );
  return result;
};
