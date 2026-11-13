import { getRepository } from '../repositories/repositoryFactory.js';

export class ChatService {
  static async assertActivityAccess(activityId, profileId) {
    const repo = getRepository();
    const act = await repo.getActivityById(activityId);
    if (!act) {
      const err = new Error('Activity not found.');
      err.statusCode = 404;
      throw err;
    }

    if (act.hostProfileId === profileId) {
      return true;
    }

    const membership = await repo.getMembership(activityId, profileId);
    if (!membership || membership.status !== 'approved') {
      const err = new Error('Only the host and approved participants can access this activity group chat.');
      err.statusCode = 403;
      throw err;
    }
    return true;
  }

  static async getActivityMessages(activityId, profileId, limit = 50, offset = 0) {
    await this.assertActivityAccess(activityId, profileId);
    const repo = getRepository();
    return repo.getActivityMessages(activityId, limit, offset);
  }

  static async sendActivityMessage(activityId, profileId, content) {
    await this.assertActivityAccess(activityId, profileId);
    if (!content || !content.trim()) {
      const err = new Error('Message content cannot be empty.');
      err.statusCode = 400;
      throw err;
    }
    const repo = getRepository();
    return repo.createActivityMessage(activityId, profileId, content.trim());
  }

  static async getConversations(profileId) {
    const repo = getRepository();
    return repo.getConversationsForProfile(profileId);
  }

  static async getDirectMessages(conversationId, profileId, limit = 50, offset = 0) {
    const repo = getRepository();
    return repo.getDirectMessages(conversationId, limit, offset);
  }

  static async startDirectConversation(myProfileId, targetProfileId) {
    const repo = getRepository();
    if (myProfileId === targetProfileId) {
      const err = new Error('Cannot start a conversation with yourself.');
      err.statusCode = 400;
      throw err;
    }
    return repo.getOrCreateDirectConversation(myProfileId, targetProfileId);
  }

  static async sendDirectMessage(conversationId, senderProfileId, content) {
    if (!content || !content.trim()) {
      const err = new Error('Message content cannot be empty.');
      err.statusCode = 400;
      throw err;
    }
    const repo = getRepository();
    return repo.createDirectMessage(conversationId, senderProfileId, content.trim());
  }
}

