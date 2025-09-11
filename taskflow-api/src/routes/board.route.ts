// src/routes/board.routes.ts
import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate';
import { createBoardSchema } from '../validations/board.validation';
import * as boardController from '../controllers/board.controller';
import { updateBoardSchema } from '../validations/board.validation';
import listRoutes from './list.route';

const router = Router();

// Áp dụng authMiddleware cho tất cả các route của board và list con của nó
router.use(authMiddleware);

// --- Kết nối List Routes ---
// Chuyển tất cả các request có dạng /:boardId/lists sang cho listRoutes xử lý
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

export default router;
