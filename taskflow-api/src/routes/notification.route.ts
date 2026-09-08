import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import * as notificationController from '../controllers/notification.controller';

const router = Router();

router.use(authMiddleware);
router.get('/', notificationController.getMyNotifications);
router.patch('/:notificationId/read', notificationController.markNotificationAsRead);

export default router;