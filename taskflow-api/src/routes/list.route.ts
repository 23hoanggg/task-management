import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate';
import {
  createListSchema,
  listIdParamSchema,
  updateListSchema,
} from '../validations/list.validation';
import * as listController from '../controllers/list.controller';

const router = Router({ mergeParams: true });

router.use(authMiddleware);

router
  .route('/')
  .post(validate(createListSchema), listController.createList)
  .get(listController.getLists);

router
  .route('/:listId')
  .patch(validate(updateListSchema), listController.updateList)
  .delete(validate(listIdParamSchema), listController.deleteList);

export default router;
