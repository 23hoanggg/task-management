import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate';
import {
  updateTaskSchema,
  taskIdParamSchema,
} from '../validations/task.validation';
import * as taskController from '../controllers/task.controller';

const router = Router();
router.use(authMiddleware);

router
  .route('/:taskId')
  .get(validate(taskIdParamSchema), taskController.getTaskById)
  .patch(validate(updateTaskSchema), taskController.updateTask)
  .delete(validate(taskIdParamSchema), taskController.deleteTask);

export default router;
