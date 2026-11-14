import { Router } from 'express';
import authRoutes from './authRoutes.js';
import userRoutes from './userRoutes.js';
import activityRoutes from './activityRoutes.js';
import discoveryRoutes from './discoveryRoutes.js';
import chatRoutes from './chatRoutes.js';
import notificationRoutes from './notificationRoutes.js';
import reviewRoutes from './reviewRoutes.js';
import adminRoutes from './adminRoutes.js';
import reportRoutes from './reportRoutes.js';
import healthRoutes from './healthRoutes.js';
import { UserController } from '../controllers/userController.js';

const router = Router();

// Base API index - eliminates "Cannot GET /api"
router.get('/', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'NearMates REST API is online',
    version: '1.0.0',
    documentation: {
      health: '/api/health',
      auth: '/api/auth',
      users: '/api/users',
      activities: '/api/activities',
      discovery: '/api/discovery',
      chat: '/api/chat',
      notifications: '/api/notifications'
    }
  });
});

router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/activities', activityRoutes);
router.use('/discovery', discoveryRoutes);
router.use('/chat', chatRoutes);
router.use('/notifications', notificationRoutes);
router.use('/reviews', reviewRoutes);
router.use('/reports', reportRoutes);
router.use('/admin', adminRoutes);

// Direct shortcut endpoints for compatibility with both mobile and web patterns
router.get('/interests', UserController.getAllInterests);

export default router;
