// src/routes/board.routes.ts
import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate';
import { createBoardSchema } from '../validations/board.validation';
import * as boardController from '../controllers/board.controller';
import { updateBoardSchema } from '../validations/board.validation';
import listRoutes from './list.route';
import * as taskController from '../controllers/task.controller';

const router = Router();

router.use(authMiddleware);

router.use('/:boardId/lists', listRoutes);

router
  .route('/')
  .post(validate(createBoardSchema), boardController.createBoard)
  .get(boardController.getBoards);

router
  .route('/:boardId')
  .get(boardController.getBoardById)
  .patch(validate(updateBoardSchema), boardController.updateBoard)
  .delete(boardController.deleteBoard);

router.route('/:boardId/tasks').get(taskController.getTasksByBoard);
export default router;
