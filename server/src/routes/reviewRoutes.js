import { Router } from 'express';
import { ReviewController } from '../controllers/reviewController.js';
import { requireAuth, optionalAuth } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/', requireAuth, ReviewController.create);
router.get('/user/:id', optionalAuth, ReviewController.getForUser);

export default router;

