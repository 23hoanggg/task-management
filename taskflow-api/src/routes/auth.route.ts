import { Router } from "express";
import { loginSchema, registerSchema } from "../validations/auth.validation";
import * as authController from "../controllers/auth.controller";
import { validate } from "../middlewares/validate";

const router = Router();

router.post("/register", validate(registerSchema), authController.register);
router.post("/login", validate(loginSchema), authController.login);

export default router;
