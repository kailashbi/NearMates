import { Router } from 'express';
import { AdminController } from '../controllers/adminController.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { requireAdmin } from '../middleware/adminMiddleware.js';

const router = Router();

router.use(requireAuth, requireAdmin);

router.get('/dashboard', AdminController.getDashboard);
router.get('/users', AdminController.listUsers);
router.get('/reports', AdminController.listReports);
router.put('/reports/:id', AdminController.updateReport);

export default router;

