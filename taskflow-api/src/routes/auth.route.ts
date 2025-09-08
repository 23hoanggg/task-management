import { Router } from 'express';
import { loginSchema, registerSchema } from '../validations/auth.validation';
import * as authController from '../controllers/auth.controller';
import { validate } from '../middlewares/validate';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);
router.post('/refresh', authController.refreshAccessToken);
router.get('/me', authMiddleware, authController.getMe);
export default router;
