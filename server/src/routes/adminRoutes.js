import { Router } from 'express';
import { AdminController } from '../controllers/adminController.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { requireAdmin } from '../middleware/adminMiddleware.js';

const router = Router();

router.use(requireAuth, requireAdmin);

// Analytics
router.get('/dashboard', AdminController.getDashboard);

// User Management
router.get('/users', AdminController.listUsers);
router.post('/users/:id/ban', AdminController.banUser);
router.post('/users/:id/suspend', AdminController.suspendUser);
router.post('/users/:id/unsuspend', AdminController.unsuspendUser);
router.post('/users/:id/warn', AdminController.warnUser);

// Activity Management
router.get('/activities', AdminController.listActivities);
router.get('/activities/:id', AdminController.getActivityDetails);
router.post('/activities/:id/remove', AdminController.removeActivity);
router.post('/activities/:id/cancel', AdminController.cancelActivity);

// Reports & Moderation
router.get('/reports', AdminController.listReports);
router.get('/reports/:id', AdminController.getReportDetails);
router.put('/reports/:id/status', AdminController.updateReport);
router.put('/reports/:id', AdminController.resolveReport);
router.post('/reports/:id/resolve', AdminController.resolveReport);

export default router;
