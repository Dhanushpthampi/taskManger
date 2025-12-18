import Notification, { INotification } from '../models/Notification';

class NotificationService {
  async createNotification(
    recipientId: string,
    taskId: string,
    message: string
  ): Promise<INotification> {
    const notification = await Notification.create({
      recipientId,
      taskId,
      message,
    });
    return notification;
  }

  async getUserNotifications(userId: string): Promise<INotification[]> {
    return Notification.find({ recipientId: userId }).sort({ createdAt: -1 });
  }

  async markAsRead(notificationId: string): Promise<INotification | null> {
    return Notification.findByIdAndUpdate(
      notificationId,
      { read: true },
      { new: true }
    );
  }

  async markAllAsRead(userId: string): Promise<void> {
    await Notification.updateMany(
      { recipientId: userId, read: false },
      { read: true }
    );
  }
}

export default new NotificationService();
