import { Router } from 'express';
import { ActivityController } from '../controllers/activityController.js';
import { requireAuth, optionalAuth } from '../middleware/authMiddleware.js';
import { createActivityLimiter } from '../middleware/rateLimiter.js';

const router = Router();

router.get('/', optionalAuth, ActivityController.list);
router.post('/', requireAuth, createActivityLimiter, ActivityController.create);
router.get('/:id', optionalAuth, ActivityController.getById);
router.put('/:id', requireAuth, ActivityController.update);
router.delete('/:id', requireAuth, ActivityController.cancel);
router.patch('/:id/cancel', requireAuth, ActivityController.cancel);

// Membership lifecycle
router.post('/:id/join', requireAuth, ActivityController.join);
router.post('/:id/leave', requireAuth, ActivityController.leave);
router.delete('/:id/membership', requireAuth, ActivityController.leave);
router.post('/:id/memberships/:membershipId/approve', requireAuth, ActivityController.approveRequest);
router.post('/:id/memberships/:membershipId/reject', requireAuth, ActivityController.rejectRequest);

export default router;

