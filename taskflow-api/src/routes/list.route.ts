import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate';
import {
  createListSchema,
  listIdParamSchema,
  updateListSchema,
} from '../validations/list.validation';
import * as listController from '../controllers/list.controller';
import taskRoutes from './task.route';
import { createTaskSchema } from '../validations/task.validation';
import * as taskController from '../controllers/task.controller';

const router = Router({ mergeParams: true });

router.use(authMiddleware);

router.patch('/reorder', listController.reorderLists);

router
  .route('/')
  .post(validate(createListSchema), listController.createList)
  .get(listController.getLists);

router
  .route('/:listId')
  .patch(validate(updateListSchema), listController.updateList)
  .delete(validate(listIdParamSchema), listController.deleteList);

router.post(
  '/:listId/tasks',
  validate(createTaskSchema),
  taskController.createTask,
);

router.use('/:listId/tasks', taskRoutes);

export default router;
