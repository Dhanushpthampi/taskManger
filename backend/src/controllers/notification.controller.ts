import { Request, Response } from 'express';
import NotificationService from '../services/notification.service';

class NotificationController {
  async getMyNotifications(req: Request, res: Response) {
    try {
      const notifications = await NotificationService.getUserNotifications(req.user as string);
      res.json(notifications);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  }

  async markRead(req: Request, res: Response) {
    try {
      const notification = await NotificationService.markAsRead(req.params.id);
      res.json(notification);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  }

  async markAllRead(req: Request, res: Response) {
    try {
      await NotificationService.markAllAsRead(req.user as string);
      res.json({ message: 'All marked as read' });
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  }
}

export default new NotificationController();
