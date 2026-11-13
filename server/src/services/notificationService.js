import { getRepository } from '../repositories/repositoryFactory.js';

export class NotificationService {
  static async createNotification(data) {
    const repo = getRepository();
    return repo.createNotification(data);
  }

  static async getNotifications(profileId, limit = 20, offset = 0) {
    const repo = getRepository();
    return repo.getUserNotifications(profileId, limit, offset);
  }

  static async markAsRead(notificationId, profileId) {
    const repo = getRepository();
    return repo.markNotificationRead(notificationId, profileId);
  }

  static async markAllAsRead(profileId) {
    const repo = getRepository();
    return repo.markAllNotificationsRead(profileId);
  }

  static async getUnreadCount(profileId) {
    const repo = getRepository();
    return repo.getUnreadNotificationCount(profileId);
  }
}

