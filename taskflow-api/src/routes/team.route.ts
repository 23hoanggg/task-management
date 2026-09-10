import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import * as teamController from '../controllers/team.controller';

const router = Router();

router.use(authMiddleware);

// POST /teams (Body: { boardId, name })
router.post('/', teamController.createTeam);

// GET /teams/board/:boardId
router.get('/board/:boardId', teamController.getTeamsByBoard);

// PATCH /teams/:teamId/members (Body: { userId, action })
router.patch('/:teamId/members', teamController.updateTeamMembers);

// DELETE /teams/:teamId
router.delete('/:teamId', teamController.deleteTeam);

export default router;
