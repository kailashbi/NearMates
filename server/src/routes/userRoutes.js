import { Router } from 'express';
import { UserController } from '../controllers/userController.js';
import { requireAuth, optionalAuth } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/me', requireAuth, UserController.getMe);
router.put('/me', requireAuth, UserController.updateMe);
router.get('/interests', UserController.getAllInterests);
router.get('/interests/me', requireAuth, UserController.getUserInterests);
router.post('/interests', requireAuth, UserController.setUserInterests);
router.get('/:id', optionalAuth, UserController.getProfileById);

export default router;

