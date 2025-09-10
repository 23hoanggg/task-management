// src/routes/board.routes.ts
import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate';
import { createBoardSchema } from '../validations/board.validation';
import * as boardController from '../controllers/board.controller';
import { updateBoardSchema } from '../validations/board.validation';

const router = Router();

router.use(authMiddleware);

router
  .route('/')
  .post(validate(createBoardSchema), boardController.createBoard)
  .get(boardController.getBoards);

router.route('/:boardId').get(boardController.getBoardById);

router
  .route('/:boardId')
  .get(boardController.getBoardById)
  .patch(validate(updateBoardSchema), boardController.updateBoard)
  .delete(boardController.deleteBoard);

export default router;
