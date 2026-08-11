import { Router } from "express";
import * as authController from "../controllers/auth.controller.js";
import { validateBody } from "../middleware/validate.js";
import {
  forgotPasswordSchema,
  signInSchema,
  signUpSchema,
} from "../validators/auth.validators.js";

const router = Router();

router.post("/sign-up", validateBody(signUpSchema), authController.signUp);
router.post("/sign-in", validateBody(signInSchema), authController.signIn);
router.post(
  "/forgot-password",
  validateBody(forgotPasswordSchema),
  authController.forgotPassword,
);

export default router;
