import { Router } from 'express';
import { ChatController } from '../controllers/chatController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/conversations', requireAuth, ChatController.getConversations);
router.post('/conversations', requireAuth, ChatController.startDirectConversation);
router.get('/conversations/:conversationId/messages', requireAuth, ChatController.getDirectMessages);
router.post('/conversations/:conversationId/messages', requireAuth, ChatController.sendDirectMessage);
router.get('/:conversationId/messages', requireAuth, ChatController.getDirectMessages);

// Activity chat endpoints
router.get('/activities/:activityId/messages', requireAuth, ChatController.getActivityMessages);
router.post('/activities/:activityId/messages', requireAuth, ChatController.sendActivityMessage);

export default router;

