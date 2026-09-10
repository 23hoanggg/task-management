import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import * as invitationController from '../controllers/board-invitation.controller';

const router = Router();

router.use(authMiddleware);

router.post('/:invitationId/respond', invitationController.respondInvite);

export default router;
