import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';
import { getRepository } from '../repositories/repositoryFactory.js';
import { ChatService } from '../services/chatService.js';
import { logger } from '../utils/logger.js';

export function initializeSocket(io) {
  // Map of profileId -> Set of socket IDs for presence
  const onlineUsers = new Map();

  // Socket authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token ||
                    socket.handshake.headers?.authorization?.replace('Bearer ', '') ||
                    socket.handshake.query?.token;

      if (!token) {
        return next(new Error('Authentication error: Token required'));
      }

      const decoded = jwt.verify(token, config.jwtSecret);
      const repo = getRepository();
      const user = await repo.findUserById(decoded.userId);
      if (!user) {
        return next(new Error('Authentication error: User not found'));
      }

      const profile = await repo.getProfileByUserId(user.userId);
      socket.user = {
        userId: user.userId,
        profileId: profile ? profile.profileId : user.profileId,
        displayName: profile ? profile.displayName : user.displayName
      };

      next();
    } catch (err) {
      next(new Error(`Authentication error: ${err.message}`));
    }
  });

  io.on('connection', (socket) => {
    const { profileId, displayName } = socket.user;
    logger.info(`Socket connected: ${displayName} (${profileId}) [${socket.id}]`);

    // Track online status
    if (!onlineUsers.has(profileId)) {
      onlineUsers.set(profileId, new Set());
      // Broadcast online status to interested peers
      io.emit('user:presence', { profileId, status: 'online' });
    }
    onlineUsers.get(profileId).add(socket.id);

    // Join personal room for private notifications / direct messages
    socket.join(`user:${profileId}`);

    // --- Activity Group Chat ---
    socket.on('join_activity', async ({ activityId }) => {
      try {
        await ChatService.assertActivityAccess(activityId, profileId);
        socket.join(`activity:${activityId}`);
        logger.debug(`User ${profileId} joined room activity:${activityId}`);
        socket.emit('activity_joined', { activityId });
      } catch (err) {
        socket.emit('chat:error', { error: err.message, activityId });
      }
    });

    socket.on('leave_activity', ({ activityId }) => {
      socket.leave(`activity:${activityId}`);
      logger.debug(`User ${profileId} left room activity:${activityId}`);
    });

    socket.on('activity:typing', ({ activityId, isTyping }) => {
      socket.to(`activity:${activityId}`).emit('activity:typing', {
        activityId,
        profileId,
        displayName,
        isTyping
      });
    });

    socket.on('activity:send_message', async ({ activityId, content }) => {
      try {
        const msg = await ChatService.sendActivityMessage(activityId, profileId, content);
        // Broadcast to everyone in the room (including sender)
        io.to(`activity:${activityId}`).emit('new_message', msg);
        io.to(`activity:${activityId}`).emit('message_created', msg); // support mobile event name
      } catch (err) {
        socket.emit('chat:error', { error: err.message, activityId });
      }
    });

    // --- Direct 1-on-1 Chat ---
    socket.on('direct:join', ({ conversationId }) => {
      socket.join(`conversation:${conversationId}`);
    });

    socket.on('direct:leave', ({ conversationId }) => {
      socket.leave(`conversation:${conversationId}`);
    });

    socket.on('direct:typing', ({ conversationId, isTyping }) => {
      socket.to(`conversation:${conversationId}`).emit('direct:typing', {
        conversationId,
        profileId,
        isTyping
      });
    });

    socket.on('direct:send_message', async ({ conversationId, recipientProfileId, content }) => {
      try {
        const msg = await ChatService.sendDirectMessage(conversationId, profileId, content);
        io.to(`conversation:${conversationId}`).emit('direct:new_message', msg);
        // Also notify recipient personal room in case they don't have conversation open
        if (recipientProfileId) {
          io.to(`user:${recipientProfileId}`).emit('notification:new_message', {
            conversationId,
            senderName: displayName,
            content
          });
        }
      } catch (err) {
        socket.emit('chat:error', { error: err.message, conversationId });
      }
    });

    // --- Disconnect & Cleanup ---
    socket.on('disconnect', () => {
      logger.info(`Socket disconnected: ${displayName} (${profileId})`);
      const userSockets = onlineUsers.get(profileId);
      if (userSockets) {
        userSockets.delete(socket.id);
        if (userSockets.size === 0) {
          onlineUsers.delete(profileId);
          io.emit('user:presence', { profileId, status: 'offline' });
        }
      }
    });
  });

  return io;
}

