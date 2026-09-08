import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate';
import {
  createBoardSchema,
  updateBoardSchema,
} from '../validations/board.validation';
import * as boardController from '../controllers/board.controller';
import * as taskController from '../controllers/task.controller';
import * as invitationController from '../controllers/board-invitation.controller';
import listRoutes from './list.route';

const router = Router();

router.use(authMiddleware);

// Mount List routes (Ví dụ: /boards/:boardId/lists)
router.use('/:boardId/lists', listRoutes);

// Quản lý Board
router
  .route('/')
  .post(validate(createBoardSchema), boardController.createBoard)
  .get(boardController.getBoards);

router
  .route('/:boardId')
  .get(boardController.getBoardById)
  .patch(validate(updateBoardSchema), boardController.updateBoard)
  .delete(boardController.deleteBoard);

// Quản lý Members & Co-managers
router.get('/:boardId/members', boardController.getMembers);
router.post('/:boardId/co-managers', boardController.addCoManager);
router.delete(
  '/:boardId/co-managers/:targetUserId',
  boardController.removeCoManager,
);

// Gửi lời mời qua Email
router.post('/:boardId/invitations', invitationController.inviteUser);

// Thao tác với Tasks trong phạm vi Board
router.get('/:boardId/tasks', taskController.getTasksByBoard);
router.patch('/:boardId/tasks/reorder', taskController.reorderTasks);

export default router;
