import { Router } from 'express';
import { DiscoveryController } from '../controllers/discoveryController.js';
import { requireAuth, optionalAuth } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/nearby', optionalAuth, DiscoveryController.getNearby);
router.get('/matches', requireAuth, DiscoveryController.getMatches);

export default router;

