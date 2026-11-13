import { ChatService } from '../services/chatService.js';

export class ChatController {
  static async getConversations(req, res, next) {
    try {
      const conversations = await ChatService.getConversations(req.user.profileId);
      res.status(200).json({ items: conversations });
    } catch (err) {
      next(err);
    }
  }

  static async getDirectMessages(req, res, next) {
    try {
      const limit = parseInt(req.query.limit) || 50;
      const offset = parseInt(req.query.offset) || 0;
      const result = await ChatService.getDirectMessages(req.params.conversationId, req.user.profileId, limit, offset);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }

  static async startDirectConversation(req, res, next) {
    try {
      const { targetProfileId } = req.body;
      if (!targetProfileId) {
        return res.status(400).json({
          statusCode: 400,
          error: 'Bad Request',
          message: 'targetProfileId is required.'
        });
      }
      const conversation = await ChatService.startDirectConversation(req.user.profileId, targetProfileId);
      res.status(200).json(conversation);
    } catch (err) {
      next(err);
    }
  }

  static async sendDirectMessage(req, res, next) {
    try {
      const { content } = req.body;
      const msg = await ChatService.sendDirectMessage(req.params.conversationId, req.user.profileId, content);
      res.status(201).json(msg);
    } catch (err) {
      next(err);
    }
  }

  static async getActivityMessages(req, res, next) {
    try {
      const limit = parseInt(req.query.limit) || 50;
      const offset = parseInt(req.query.offset) || 0;
      const result = await ChatService.getActivityMessages(req.params.activityId, req.user.profileId, limit, offset);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }

  static async sendActivityMessage(req, res, next) {
    try {
      const { content } = req.body;
      const msg = await ChatService.sendActivityMessage(req.params.activityId, req.user.profileId, content);
      res.status(201).json(msg);
    } catch (err) {
      next(err);
    }
  }
}

