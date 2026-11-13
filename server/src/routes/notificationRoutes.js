import { Router } from 'express';
import { NotificationController } from '../controllers/notificationController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/', requireAuth, NotificationController.list);
router.get('/unread-count', requireAuth, NotificationController.getUnreadCount);
router.put('/read-all', requireAuth, NotificationController.markAllRead);
router.patch('/read-all', requireAuth, NotificationController.markAllRead);
router.put('/:id/read', requireAuth, NotificationController.markRead);
router.patch('/:id/read', requireAuth, NotificationController.markRead);

export default router;

