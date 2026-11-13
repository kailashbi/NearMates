import { NotificationService } from '../services/notificationService.js';

export class NotificationController {
  static async list(req, res, next) {
    try {
      const limit = parseInt(req.query.limit) || 20;
      const offset = parseInt(req.query.offset) || 0;
      const result = await NotificationService.getNotifications(req.user.profileId, limit, offset);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }

  static async markRead(req, res, next) {
    try {
      const updated = await NotificationService.markAsRead(req.params.id, req.user.profileId);
      res.status(200).json({ success: true, item: updated });
    } catch (err) {
      next(err);
    }
  }

  static async markAllRead(req, res, next) {
    try {
      await NotificationService.markAllAsRead(req.user.profileId);
      res.status(200).json({ success: true, message: 'All notifications marked as read.' });
    } catch (err) {
      next(err);
    }
  }

  static async getUnreadCount(req, res, next) {
    try {
      const unreadCount = await NotificationService.getUnreadCount(req.user.profileId);
      res.status(200).json({ unreadCount });
    } catch (err) {
      next(err);
    }
  }
}

