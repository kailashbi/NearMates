import { Router } from 'express';
import { ReportController } from '../controllers/reportController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = Router();

router.use(requireAuth);

router.post('/', ReportController.createReport);
router.get('/my', ReportController.getMyReports);

export default router;
