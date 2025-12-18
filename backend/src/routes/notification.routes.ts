import { Router } from 'express';
import { protect as authenticate } from '../middlewares/authMiddleware';
import NotificationController from '../controllers/notification.controller';

const router = Router();

router.use(authenticate);

router.get('/', NotificationController.getMyNotifications);
router.patch('/:id/read', NotificationController.markRead);
router.patch('/read-all', NotificationController.markAllRead);

export default router;
